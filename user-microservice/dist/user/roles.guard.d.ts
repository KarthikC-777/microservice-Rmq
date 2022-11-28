import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { userDocument } from './user.schema';
import { Model } from 'mongoose';
export declare class RolesGuard implements CanActivate {
    private readonly userModel;
    private reflector;
    private jwtService;
    constructor(userModel: Model<userDocument>, reflector: Reflector, jwtService: JwtService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
