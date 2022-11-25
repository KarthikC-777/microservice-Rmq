import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { leaveDocument, statusEnum } from './leave.schema';
import { leaveDto } from 'src/dto/leave.dto';
import { Cache } from 'cache-manager';
const userProjection = {
  __v: false,
  _id: false,
  approveLink: false,
  rejectLink: false,
};

@Injectable()
export class LeaveService {
  constructor(
    @InjectModel('Leave') private readonly leaveModel: Model<leaveDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async applyLeave(data: leaveDto): Promise<any> {
    try {
      const newDate = new Date(data.leaveDate);
      const leaveExist = await this.leaveModel.findOne({
        email: data.email,
        leaveDate: newDate.toISOString(),
      });
      if (leaveExist && leaveExist.rejected === true) {
        throw new HttpException(
          `For this date  ${data.leaveDate} , Leave is rejected `,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (leaveExist) {
        throw new HttpException(
          `Leave already exists for date ${data.leaveDate}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const newLeave = new this.leaveModel({
        email: data.email,
        leaveDate: newDate.toISOString(),
        userId: data.userId,
      });
      await newLeave.save();
      return {
        status: HttpStatus.CREATED,
        message: `sucessfully leave apllied for date ${data.leaveDate}`,
      };
    } catch (error) {
      return {
        status: error.status,
        message: error.message,
      };
    }
  }

  async checkEmployeeLeave(limitOfDocs = 0, toSkip = 0): Promise<any> {
    await this.cacheManager.set('cached_item', { key: 2 });
    await this.cacheManager.get('cached_item');
    return await this.leaveModel
      .find({}, userProjection)
      .skip(toSkip)
      .limit(limitOfDocs)
      .exec();
  }

  async viewOwnLeave(data: leaveDto, limitOfDocs = 0, toSkip = 0) {
    try {
      await this.cacheManager.set('cached_item', { key: 3 });
      await this.cacheManager.get('cached_item');
      const existUser = await this.leaveModel
        .find({ email: data.email }, userProjection)
        .skip(toSkip)
        .limit(limitOfDocs)
        .exec();
      if (existUser.length < limitOfDocs) {
        throw new HttpException('No leaves to show', HttpStatus.NOT_FOUND);
      }
      if (existUser.length === 0) {
        throw new HttpException(
          `User with the email ${data.email}, Not apllied any leaves`,
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        message: `Details of user with status ${data.email}`,
        result: existUser,
        status: HttpStatus.OK,
      };
    } catch (error) {
      return {
        status: error.status,
        message: error.message,
      };
    }
  }

  async viewEmployeePendingLeaveByUserId(
    data: leaveDto,
    limitOfDocs = 3,
    toSkip = 0,
  ): Promise<any> {
    try {
      await this.cacheManager.set('cached_item', { key: 4 });
      await this.cacheManager.get('cached_item');
      let links = {};
      let documents = await this.leaveModel.find(
        { userId: data.userId },
        userProjection,
      );
      let existUser = await this.leaveModel
        .find({ userId: data.userId }, userProjection)
        .skip(toSkip)
        .limit(limitOfDocs)
        .exec();
      links = {
        Start_Page: `http://localhost:3000/user/view-leaves?userId=${data.userId}&limit=${limitOfDocs}&skip=0`,
      };
      if (documents.length - limitOfDocs > limitOfDocs) {
        links['End_Page'] = `http://localhost:3000/user/view-leaves?userId=${
          data.userId
        }&limit=${limitOfDocs}&skip=${documents.length - limitOfDocs}`;
      } else {
        links[
          'End_Page'
        ] = `http://localhost:3000/user/view-leaves?userId=${data.userId}&limit=${limitOfDocs}&skip=${limitOfDocs}`;
      }
      if (!data.userId) {
        documents = await this.leaveModel.find({}, userProjection);
        links = {
          Start_Page: `http://localhost:3000/user/view-leaves?limit=${limitOfDocs}&skip=0`,
        };
        if (documents.length - limitOfDocs > limitOfDocs) {
          links[
            'End_Page'
          ] = `http://localhost:3000/user/view-leaves?limit=${limitOfDocs}&skip=${
            documents.length - limitOfDocs
          }`;
        } else {
          links[
            'End_Page'
          ] = `http://localhost:3000/user/view-leaves?limit=${limitOfDocs}&skip=${limitOfDocs}`;
        }
        existUser = await this.leaveModel
          .find({}, userProjection)
          .skip(toSkip)
          .limit(limitOfDocs)
          .exec();
      }
      if (!existUser) {
        throw new HttpException('Invalid User ', HttpStatus.NOT_FOUND);
      } else if (existUser.length === 0) {
        throw new HttpException(
          'no Pending leaves or invalid User Id ',
          HttpStatus.NOT_FOUND,
        );
      }
      if (data.userId) {
        if (toSkip - limitOfDocs >= 0)
          links[
            'Previous_Page'
          ] = `http://localhost:3000/user/view-leaves?userId=${
            data.userId
          }&limit=${limitOfDocs}&skip=${toSkip - limitOfDocs}`;
        if (Number(toSkip) + Number(limitOfDocs) < documents.length)
          links['Next_Page'] = `http://localhost:3000/user/view-leaves?userId=${
            data.userId
          }&limit=${limitOfDocs}&skip=${Number(toSkip) + Number(limitOfDocs)}`;
        return {
          message: `Details of user with status ${data.userId}`,
          result: {
            totalDocument: documents.length,
            noOfDocument: existUser.length,
            existUser,
          },
          links: links,
          status: HttpStatus.OK,
        };
      } else {
        if (toSkip - limitOfDocs >= 0) {
          links[
            'Previous_Page'
          ] = `http://localhost:3000/user/view-leaves?limit=${limitOfDocs}&skip=${
            toSkip - limitOfDocs
          }`;
        }
        if (Number(toSkip) + Number(limitOfDocs) < documents.length) {
          links[
            'Next_Page'
          ] = `http://localhost:3000/user/view-leaves?limit=${limitOfDocs}&skip=${
            Number(toSkip) + Number(limitOfDocs)
          }`;
        }
        return {
          message: `Details of users with status `,
          result: {
            totalDocument: documents.length,
            noOfDocument: existUser.length,
            existUser,
          },
          links: links,
          status: HttpStatus.OK,
        };
      }
    } catch (error) {
      return {
        status: error.status,
        message: error.message,
      };
    }
  }

  async viewEmployeePendingLeave(
    data: leaveDto,
    limitOfDocs = 3,
    toSkip = 0,
  ): Promise<any> {
    try {
      await this.cacheManager.set('cached_item', { key: 5 });
      await this.cacheManager.get('cached_item');
      const statusEnum_key = Object.keys(statusEnum).find(
        (key) => statusEnum[key] === data.status,
      );
      let existUser, documents, links;
      if (!data.userId) {
        documents = await this.leaveModel.find(
          { status: statusEnum_key, rejected: { $exists: false } },
          userProjection,
        );
        existUser = await this.leaveModel
          .find({
            status: statusEnum_key,
            rejected: { $exists: false },
          })
          .skip(toSkip)
          .limit(limitOfDocs)
          .exec();
        links = {
          Start_Page: `http://localhost:3000/user/view-leaves?status=${data.status}&limit=${limitOfDocs}&skip=0`,
        };
        if (documents.length - limitOfDocs > limitOfDocs) {
          links['End_Page'] = `http://localhost:3000/user/view-leaves?status=${
            data.status
          }&limit=${limitOfDocs}&skip=${documents.length - limitOfDocs}`;
        } else {
          links[
            'End_Page'
          ] = `http://localhost:3000/user/view-leaves?status=${data.status}&limit=${limitOfDocs}&skip=${limitOfDocs}`;
        }
      } else {
        documents = await this.leaveModel.find(
          {
            userId: data.userId,
            status: statusEnum_key,
            rejected: { $exists: false },
          },
          userProjection,
        );
        existUser = await this.leaveModel
          .find({
            userId: data.userId,
            status: statusEnum_key,
            rejected: { $exists: false },
          })
          .skip(toSkip)
          .limit(limitOfDocs)
          .exec();
        links = {
          Start_Page: `http://localhost:3000/user/view-leaves?status=${data.status}&userId=${data.userId}&limit=${limitOfDocs}&skip=0`,
        };
        if (documents.length - limitOfDocs > limitOfDocs) {
          links['End_Page'] = `http://localhost:3000/user/view-leaves?status=${
            data.status
          }&userId=${data.userId}&limit=${limitOfDocs}&skip=${
            documents.length - limitOfDocs
          }`;
        } else {
          links[
            'End_Page'
          ] = `http://localhost:3000/user/view-leaves?status=${data.status}&userId=${data.userId}&limit=${limitOfDocs}&skip=${limitOfDocs}`;
        }
      }

      if (!existUser) {
        throw new HttpException('Invalid User ', HttpStatus.NOT_FOUND);
      }

      if (data.status === 'Pending')
        for (let i = 0; i < existUser.length; i++) {
          existUser[
            i
          ].approveLink = `http://localhost:3000/user/approve-leaves?leaveDate=${existUser[i].leaveDate}&userId=${existUser[i].userId}`;
          existUser[
            i
          ].rejectLink = `http://localhost:3000/user/reject-leaves?leaveDate=${existUser[i].leaveDate}&userId=${existUser[i].userId}`;
          existUser[i].save();
        }
      if (!data.userId) {
        if (toSkip - limitOfDocs >= 0)
          links[
            'Previous_Page'
          ] = `http://localhost:3000/user/view-leaves?status=${
            data.status
          }&limit=${limitOfDocs}&skip=${toSkip - limitOfDocs}`;
        if (Number(toSkip) + Number(limitOfDocs) < documents.length)
          links['Next_Page'] = `http://localhost:3000/user/view-leaves?status=${
            data.status
          }&limit=${limitOfDocs}&skip=${Number(toSkip) + Number(limitOfDocs)}`;
        return {
          message: `Details of user with status ${data.status}`,
          result: {
            totalDocument: documents.length,
            noOfDocument: existUser.length,
            existUser,
          },
          links: links,
          status: HttpStatus.OK,
        };
      } else {
        if (toSkip - limitOfDocs >= 0)
          links[
            'Previous_Page'
          ] = `http://localhost:3000/user/view-leaves?status=${
            data.status
          }&userId=${data.userId}&limit=${limitOfDocs}&skip=${
            toSkip - limitOfDocs
          }`;
        if (Number(toSkip) + Number(limitOfDocs) < documents.length)
          links['Next_Page'] = `http://localhost:3000/user/view-leaves?status=${
            data.status
          }&userId=${data.userId}&limit=${limitOfDocs}&skip=${
            Number(toSkip) + Number(limitOfDocs)
          }`;
        return {
          message: `Details of user with User Id ${data.userId} and status ${data.status}`,
          result: {
            totalDocument: documents.length,
            noOfDocument: existUser.length,
            existUser,
          },
          links: links,
          status: HttpStatus.OK,
        };
      }
    } catch (error) {
      return {
        status: error.status,
        message: error.message,
      };
    }
  }

  async approveEmployeeLeaves(data: leaveDto): Promise<any> {
    try {
      const newDate = new Date(data.date);
      const IsoDate = newDate.toISOString();
      const user = await this.leaveModel.findOneAndUpdate(
        {
          userId: data.userId,
          leaveDate: IsoDate,
          status: false,
          approveLink: `http://localhost:3000/user/approve-leaves?leaveDate=${IsoDate}&userId=${data.userId}`,
        },
        {
          $set: { status: true },
          $unset: {
            approveLink: `http://localhost:3000/user/approve-leaves?leaveDate=${IsoDate}&userId=${data.userId}`,
            rejectLink: `http://localhost:3000/user/reject-leaves?leaveDate=${IsoDate}&userId=${data.userId}`,
          },
        },
      );
      if (user) {
        return {
          message: `Leave approved successfully for date ${data.date}`,
          status: HttpStatus.OK,
        };
      } else {
        throw new HttpException('Link expired', HttpStatus.GONE);
      }
    } catch (error) {
      return {
        status: error.status,
        message: error.message,
      };
    }
  }

  async rejectEmployeeLeaves(data: leaveDto): Promise<any> {
    try {
      const newDate = new Date(data.date);
      const IsoDate = newDate.toISOString();
      const user = await this.leaveModel.findOneAndUpdate(
        {
          userId: data.userId,
          leaveDate: IsoDate,
          status: false,
          rejectLink: `http://localhost:3000/user/reject-leaves?leaveDate=${IsoDate}&userId=${data.userId}`,
        },
        {
          $unset: {
            approveLink: `http://localhost:3000/user/approve-leaves?leaveDate=${IsoDate}&userId=${data.userId}`,
            rejectLink: `http://localhost:3000/user/reject-leaves?leaveDate=${IsoDate}&userId=${data.userId}`,
          },
        },
      );
      if (user) {
        user.rejected = true;
        user.save();
        return {
          message: `Leave rejected successfully for date ${data.date}`,
          status: HttpStatus.OK,
        };
      } else {
        throw new HttpException('Link expired', HttpStatus.GONE);
      }
    } catch (error) {
      return {
        status: error.status,
        message: error.message,
      };
    }
  }
}
