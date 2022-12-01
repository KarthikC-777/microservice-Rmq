import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Roles } from './entities/roles.decorator';
import { JwtService } from '@nestjs/jwt';
import { HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { userDocument } from './user.schema';
import { Model } from 'mongoose';
import { UserDto } from './dto/user.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<userDocument>,
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      let formatError = {};
      const request = context.switchToHttp().getRequest();
      console.log('request                    ----', request.user.payload);
      request.myData = request.user.payload;
      const verifyUser: UserDto = request.user.payload;
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (!requiredRoles) {
        return true;
      }
      const checkDb = await this.userModel.find();
      if (checkDb.length == 0) return true;
      if (!verifyUser || !verifyUser.role?.includes('admin')) {
        formatError = {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Only Access to Admin , If your Admin Please Login ',
          result: [],
          error: 'UNAUTHORIZED',
        };
        throw new HttpException(formatError, HttpStatus.UNAUTHORIZED);
      }
      return requiredRoles.some((role) => verifyUser.role?.includes(role));
    } catch (error) {
      throw new HttpException(error.response, error.status);
    }
  }
}
