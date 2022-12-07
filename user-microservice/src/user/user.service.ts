import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { user, UserDesignation, userDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import { UserDto } from './dto/user.dto';
import { loginDto } from './dto/login.dto';
import { UpdateDto } from './dto/update.dto';
import { EmployeeDto } from './dto/employee.dto';
import { randomBytes } from 'crypto';
import { forgotDto } from './dto/forgot.dto';
import { resetDto } from './dto/reset.dto';
import { ClientProxy } from '@nestjs/microservices';
import { leaveDto } from './dto/leave.dto';
import { map } from 'rxjs';
import { Cache } from 'cache-manager';
import { stringify } from 'querystring';
const userProjection = {
  __v: false,
  _id: false,
  approveLink: false,
  rejectLink: false,
  password: false,
  resetToken: false,
};

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<userDocument>,
    private jwtService: JwtService,
    @Inject('LEAVE') private readonly leaveClient: ClientProxy,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  functionVerify = async (token: string | undefined) => {
    try {
      if (token === undefined) {
        throw new HttpException('Please Login Again ', HttpStatus.NOT_FOUND);
      }
      const verifyUser = await this.jwtService.verify(token);
      if (!verifyUser) {
        throw new HttpException(
          'Unauthorized  User error ',
          HttpStatus.UNAUTHORIZED,
        );
      }
      return verifyUser;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  };

  async signup(userDto: UserDto): Promise<user[]> {
    try {
      let formatError = {};
      const designationKey = Object.keys(UserDesignation).find(
        (key) => key === userDto.designation,
      );
      if (designationKey === undefined) {
        formatError = {
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'Provide proper designation, Valid Designation: ASE,SE,SSE,EM,BD',
          result: [],
          error: 'Bad Request',
        };
        throw new HttpException(formatError, HttpStatus.BAD_REQUEST);
      }
      const existingUser = await this.userModel.findOne({
        email: userDto.email,
      });
      if (existingUser) {
        formatError = {
          statusCode: HttpStatus.CONFLICT,
          message: 'Email already taken',
          result: [],
          error: 'CONFLICT',
        };
        throw new HttpException(formatError, HttpStatus.CONFLICT);
      }
      const createdUser = new this.userModel(userDto);
      const salt = await bcrypt.genSalt();
      createdUser.password = await bcrypt.hash(createdUser.password, salt);
      createdUser.designation = UserDesignation[userDto.designation];
      const noOfDocuments = await this.userModel.find();
      createdUser['userId'] =
        'YML' + String(noOfDocuments.length + 1).padStart(3, '0');
      await createdUser.save();
      const filterOutput = await this.userModel.find(
        { email: userDto.email },
        userProjection,
      );
      return filterOutput;
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  async signin(req, userDto: loginDto, res): Promise<object> {
    try {
      let formatError = {};
      if (req.cookies['userlogoutcookie'] !== undefined) {
        const checkAlredySignin = await this.functionVerify(
          req.cookies['userlogoutcookie'],
        );
        if (checkAlredySignin.Email === userDto.email) {
          formatError = {
            statusCode: HttpStatus.CONFLICT,
            message: 'You are already signed In',
            result: [],
            error: 'CONFLICT',
          };
          throw new HttpException(formatError, HttpStatus.CONFLICT);
        }
      }
      const checkUser = await this.userModel.findOne({
        email: userDto.email,
      });
      if (!checkUser) {
        formatError = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Incorrect Email',
          result: [],
          error: 'BAD_REQUEST',
        };
        throw new HttpException(formatError, HttpStatus.BAD_REQUEST);
      }
      if (checkUser.status == false) {
        formatError = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Account Deactivated',
          result: [],
          error: 'BAD_REQUEST',
        };
        throw new HttpException(formatError, HttpStatus.BAD_REQUEST);
      }
      const passwordCheck = await bcrypt.compare(
        userDto.password,
        checkUser.password,
      );
      if (!passwordCheck) {
        formatError = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Incorrect Password',
          result: [],
          error: 'BAD_REQUEST',
        };
        throw new HttpException(formatError, HttpStatus.BAD_REQUEST);
      }
      const token = await this.generateJwt(
        checkUser.image,
        checkUser.userId,
        checkUser.name,
        checkUser.email,
        checkUser.role,
      );
      res.cookie('userlogoutcookie', token.accessToken);
      return token;
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }
  generateJwt(
    image: string,
    userId: string,
    name: string,
    email: string,
    role: string[],
  ) {
    const token = this.jwtService.sign({
      image: image,
      userId: userId,
      Name: name,
      Email: email,
      role: role,
    });
    return {
      accessToken: token,
      userInfo: {
        image: image,
        userId: userId,
        Name: name,
        Email: email,
        role: role,
      },
    };
  }

  public async signout(req, res): Promise<void> {
    try {
      let formatError = {};
      if (req.cookies['userlogoutcookie'] === undefined) {
        formatError = {
          statusCode: HttpStatus.CONFLICT,
          message: 'You are already signed Out',
          result: [],
          error: 'CONFLICT',
        };
        throw new HttpException(formatError, HttpStatus.CONFLICT);
      }
      res.clearCookie('userlogoutcookie');
      res.status(HttpStatus.OK).send({
        statusCode: HttpStatus.OK,
        message: 'User signed out successfully',
        result: [],
        error: 'No Error',
      });
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  async getEmployee(
    req,
    user,
    limitOfDocs = 0,
    toSkip = 0,
  ): Promise<user | user[]> {
    try {
      console.log('Redis cache check');
      //await this.cacheManager.set('cached_item', Math.random());
      //const cachedItem = await this.cacheManager.get('cached_item');
      //console.log(cachedItem);
      await this.functionVerify(req.cookies['userlogoutcookie']);
      if (user) {
        return this.userModel.findOne({ userId: user }, userProjection).exec();
      }
      return this.userModel
        .find({}, userProjection)
        .skip(toSkip)
        .limit(limitOfDocs)
        .exec();
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async updateEmployee(
    req,
    res,
    userId: string,
    userDto: UpdateDto,
  ): Promise<object> {
    try {
      let formatError = {};
      if (userDto.designation) {
        const designationKey = Object.keys(UserDesignation).find(
          (key) => key === userDto.designation,
        );
        if (designationKey === undefined) {
          formatError = {
            statusCode: HttpStatus.BAD_REQUEST,
            message:
              'Provide proper designation, Valid Designation: ASE,SE,SSE,EM,BD',
            result: [],
            error: 'Bad Request',
          };
          throw new HttpException(formatError, HttpStatus.BAD_REQUEST);
        }
      }
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const existUser = await this.userModel.findOneAndUpdate(
        { userId: userId },
        {
          name: userDto.name,
          phonenumber: userDto.phonenumber,
          salary: userDto.salary,
          designation: UserDesignation[userDto.designation],
          address: userDto.address,
          availableLeaves: userDto.availableLeaves,
        },
      );
      if (!existUser) {
        formatError = {
          statusCode: HttpStatus.NON_AUTHORITATIVE_INFORMATION,
          message: 'Invalid User Id',
          result: [],
          error: 'NON_AUTHORITATIVE_INFORMATION',
        };
        throw new HttpException(
          formatError,
          HttpStatus.NON_AUTHORITATIVE_INFORMATION,
        );
      }
      const filterOutput = await this.userModel.find(
        { userId: userId },
        userProjection,
      );
      return filterOutput;
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  async updateOwnInfo(req, res, employeeDto: EmployeeDto): Promise<object> {
    try {
      let formatError = {};
      const verifyUser = await this.functionVerify(
        req.cookies['userlogoutcookie'],
      );
      const existUser = await this.userModel.findOneAndUpdate(
        { userId: verifyUser.userId },
        {
          name: employeeDto.name,
          phonenumber: employeeDto.phonenumber,
          address: employeeDto.address,
        },
      );
      if (!existUser) {
        formatError = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid UserId',
          result: [],
          error: 'Bad Request',
        };
        throw new HttpException(formatError, HttpStatus.BAD_REQUEST);
      }
      const filterOutput = await this.userModel.find(
        { userId: verifyUser.userId },
        userProjection,
      );
      return filterOutput;
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  async viewOwnDetails(req, res): Promise<void> {
    try {
      let formatError = {};
      const verifyUser = req.myData;
      const existUser = await this.userModel
        .find(
          {
            userId: verifyUser.userId,
          },
          userProjection,
        )
        .exec();
      if (!existUser) {
        formatError = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid UserId',
          result: [],
          error: 'Bad Request',
        };
        throw new HttpException(formatError, HttpStatus.BAD_REQUEST);
      }
      res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: `Details of ${verifyUser.userId} user with status `,
        result: existUser,
        error: 'No Error',
      });
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  public async forgotPassword(body: forgotDto, req, res): Promise<void> {
    try {
      let formatError = {};
      const user = await this.userModel.findOne({ email: body.email });
      if (!user) {
        formatError = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Incorrect Email',
          result: [],
          error: 'BAD_REQUEST',
        };
        throw new HttpException(formatError, HttpStatus.BAD_REQUEST);
      }
      const salt = await bcrypt.genSalt();
      const resetHash = await bcrypt.hash(
        randomBytes(32).toString('hex'),
        salt,
      );
      await this.userModel.updateOne(
        { email: body.email },
        { resetToken: resetHash },
      );
      res.json({
        link: `http://localhost:3000/users/reset-password?resetId=${resetHash}`,
      });
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  public async resetPassword(body: resetDto, req, res, query): Promise<void> {
    try {
      this.userModel.findOne(
        { resetToken: query.resetId },
        async (error, data) => {
          if (error) throw error;
          const salt = await bcrypt.genSalt();
          const newPassword = await bcrypt.hash(body.password, salt);
          await this.userModel.updateOne(
            { resetToken: query.resetId },
            { password: newPassword, resetToken: 0 },
          );
          res.json({
            statusCode: HttpStatus.OK,
            message: 'password updated successfuly, Login again',
            result: [],
            error: 'No Error',
          });
        },
      );
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async deactivateEmployee(userId: string, req): Promise<object> {
    try {
      let formatError = {};
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const existUser = await this.userModel.findOne({ userId: userId });
      if (!existUser) {
        formatError = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid UserId',
          result: [],
          error: 'Bad Request',
        };
        throw new HttpException(formatError, HttpStatus.BAD_REQUEST);
      }
      if (existUser.status === false) {
        formatError = {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Account is already deactivated ',
          result: [],
          error: 'FORBIDDEN',
        };
        throw new HttpException(formatError, HttpStatus.FORBIDDEN);
      }
      existUser.status = false;
      existUser.save();
      const filterOutput = await this.userModel.find(
        { userId: userId },
        userProjection,
      );
      return filterOutput;
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  async activateEmployee(userId: string, req): Promise<object> {
    try {
      let formatError = {};
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const existUser = await this.userModel.findOne({ userId: userId });
      if (!existUser) {
        formatError = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid UserId',
          result: [],
          error: 'Bad Request',
        };
        throw new HttpException(formatError, HttpStatus.BAD_REQUEST);
      }
      if (existUser.status === true) {
        formatError = {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Account is already active ',
          result: [],
          error: 'FORBIDDEN',
        };
        throw new HttpException(formatError, HttpStatus.FORBIDDEN);
      }
      existUser.status = true;
      existUser.save();
      const filterOutput = this.userModel.find(
        { userId: userId },
        userProjection,
      );
      return filterOutput;
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  async applyLeave(req, leaveDto: leaveDto): Promise<any> {
    try {
      let formatError = {};
      const verifyUser = await this.functionVerify(
        req.cookies['userlogoutcookie'],
      );
      if ('status' in leaveDto) {
        formatError = {
          statusCode: HttpStatus.FORBIDDEN,
          message: ' `Status` access in forbidden',
          result: [],
          error: 'FORBIDDEN',
        };
        throw new HttpException(formatError, HttpStatus.FORBIDDEN);
      }
      const user = await this.userModel
        .findOne({ email: verifyUser.Email })
        .exec();
      if (
        !new Date(leaveDto.leaveDate).getTime() ||
        leaveDto.leaveDate.length < 10
      ) {
        formatError = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ' `leaveDate` must be in the format yyyy-mm-dd',
          result: [],
          error: 'BAD_REQUEST',
        };
        throw new HttpException(formatError, HttpStatus.BAD_REQUEST);
      }
      const newDate = new Date(leaveDto.leaveDate);
      if (newDate.getTime() < Date.now() || user.availableLeaves < 1) {
        formatError = {
          statusCode: HttpStatus.NOT_ACCEPTABLE,
          message: 'Cannot apply leave for older dates or No leaves available',
          result: [],
          error: 'NOT_ACCEPTABLE',
        };
        throw new HttpException(formatError, HttpStatus.NOT_ACCEPTABLE);
      }
      const pattern = { cmd: 'applyLeave' };
      const payload = {
        email: verifyUser.Email,
        userId: user.userId,
        leaveDate: leaveDto.leaveDate,
      };
      return this.leaveClient.send(pattern, payload).pipe(
        map((output: any) => {
          if (output.status !== HttpStatus.OK) {
            formatError = {
              statusCode: output.statusCode,
              message: output.message,
              result: output.result,
              error: output.error,
            };
            throw new HttpException(formatError, output.statusCode);
          } else {
            return {
              statusCode: output.statusCode,
              message: output.message,
              result: output.result,
              error: output.error,
            };
          }
        }),
      );
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  async checkEmployeeLeave(req, limit, skip): Promise<any> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const pattern = { cmd: 'checkEmployeeLeave' };
      const payload = { limit: limit, skip: skip };
      return this.leaveClient.send(pattern, payload);
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  async viewOwnLeave(req, limit, skip): Promise<any> {
    try {
      const verifyUser = await this.functionVerify(
        req.cookies['userlogoutcookie'],
      );
      const pattern = { cmd: 'viewOwnLeave' };
      const payload = { email: verifyUser.Email, limit: limit, skip: skip };
      const val = this.leaveClient.send(pattern, payload).pipe(
        map((output: any) => {
          if (output.status !== HttpStatus.OK) {
            throw new HttpException(output.message, output.status);
          } else {
            return {
              status: output.status,
              message: output.message,
              result: output.result,
            };
          }
        }),
      );
      return val;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async viewEmployeePendingLeaveByUserId(
    req,
    userId,
    limit,
    skip,
  ): Promise<any> {
    try {
      let formatError = {};
      await this.functionVerify(req.cookies['userlogoutcookie']);
      if (userId) {
        const existUser = await this.userModel.findOne({ userId: userId });
        if (!existUser) {
          formatError = {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid UserId',
            result: [],
            error: 'Bad Request',
          };
          throw new HttpException(formatError, HttpStatus.BAD_REQUEST);
        }
      }
      const pattern = { cmd: 'viewEmployeePendingLeaveByUserId' };
      const payload = { userId: userId, limit: limit, skip: skip };
      return this.leaveClient.send<string>(pattern, payload).pipe(
        map((output: any) => {
          if (output.statusCode !== HttpStatus.OK) {
            formatError = {
              statusCode: output.statusCode,
              message: output.message,
              result: output.result,
              link: output.links,
              error: output.error,
            };
            throw new HttpException(formatError, output.statusCode);
          } else {
            return {
              statusCode: output.statusCode,
              message: output.message,
              result: output.result,
              links: output.links,
              error: output.error,
            };
          }
        }),
      );
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  async viewEmployeePendingLeave(
    req,
    userId: string,
    Status: string,
    limit,
    skip,
  ): Promise<any> {
    try {
      let formatError = {};
      await this.functionVerify(req.cookies['userlogoutcookie']);
      if (userId) {
        const existUser = await this.userModel.findOne({ userId: userId });
        if (!existUser) {
          formatError = {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Invalid UserId',
            result: [],
            error: 'Bad Request',
          };
          throw new HttpException(formatError, HttpStatus.BAD_REQUEST);
        }
      }
      const pattern = { cmd: 'viewEmployeePendingLeave' };
      const payload = {
        userId: userId,
        status: Status,
        limit: limit,
        skip: skip,
      };
      return this.leaveClient.send<string>(pattern, payload).pipe(
        map((output: any) => {
          if (output.status !== HttpStatus.OK) {
            formatError = {
              statusCode: output.statusCode,
              message: output.message,
              result: output.result,
              link: output.links,
              error: output.error,
            };
            throw new HttpException(formatError, output.statusCode);
          } else {
            return {
              statusCode: output.statusCode,
              message: output.message,
              result: output.result,
              links: output.links,
              error: output.error,
            };
          }
        }),
      );
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }

  async approveEmployeeLeaves(userId: string, date: string, req): Promise<any> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const emp = await this.userModel.findOne({
        userId: userId,
      });
      const pattern = { cmd: 'approveEmployeeLeaves' };
      const payload = { userId: userId, date: date };

      return this.leaveClient.send<string>(pattern, payload).pipe(
        map((output: any) => {
          if (output.status === HttpStatus.OK) {
            emp.availableLeaves = emp.availableLeaves - 1;
            emp.save();
            return {
              status: output.status,
              message: output.message,
            };
          } else {
            throw new HttpException(output.message, output.status);
          }
        }),
      );
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async rejectEmployeeLeaves(userId: string, date: string, req): Promise<any> {
    try {
      await this.functionVerify(req.cookies['userlogoutcookie']);
      const pattern = { cmd: 'rejectEmployeeLeaves' };
      const payload = { userId: userId, date: date };

      return this.leaveClient.send<string>(pattern, payload).pipe(
        map((output: any) => {
          if (output.status === HttpStatus.OK) {
            return {
              status: output.status,
              message: output.message,
            };
          } else {
            throw new HttpException(output.message, output.status);
          }
        }),
      );
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
