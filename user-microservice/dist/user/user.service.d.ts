import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { user, userDocument } from './user.schema';
import { UserDto } from './dto/user.dto';
import { loginDto } from './dto/login.dto';
import { UpdateDto } from './dto/update.dto';
import { EmployeeDto } from './dto/employee.dto';
import { forgotDto } from './dto/forgot.dto';
import { resetDto } from './dto/reset.dto';
import { ClientProxy } from '@nestjs/microservices';
import { leaveDto } from './dto/leave.dto';
import { Cache } from 'cache-manager';
export declare class UserService {
    private readonly userModel;
    private jwtService;
    private readonly leaveClient;
    private readonly cacheManager;
    constructor(userModel: Model<userDocument>, jwtService: JwtService, leaveClient: ClientProxy, cacheManager: Cache);
    functionVerify: (token: string | undefined) => Promise<any>;
    signup(userDto: UserDto): Promise<user[]>;
    signin(req: any, userDto: loginDto, res: any): Promise<object>;
    generateJwt(image: string, userId: string, name: string, email: string, role: string[]): {
        accessToken: string;
        userInfo: {
            image: string;
            userId: string;
            Name: string;
            Email: string;
            role: string[];
        };
    };
    signout(req: any, res: any): Promise<void>;
    getEmployee(req: any, user: any, limitOfDocs?: number, toSkip?: number): Promise<user | user[]>;
    updateEmployee(req: any, res: any, userId: string, userDto: UpdateDto): Promise<object>;
    updateOwnInfo(req: any, res: any, employeeDto: EmployeeDto): Promise<object>;
    viewOwnDetails(req: any, res: any): Promise<void>;
    forgotPassword(body: forgotDto, req: any, res: any): Promise<void>;
    resetPassword(body: resetDto, req: any, res: any, query: any): Promise<void>;
    deactivateEmployee(userId: string, req: any): Promise<object>;
    activateEmployee(userId: string, req: any): Promise<object>;
    applyLeave(req: any, leaveDto: leaveDto): Promise<any>;
    checkEmployeeLeave(req: any, limit: any, skip: any): Promise<any>;
    viewOwnLeave(req: any, limit: any, skip: any): Promise<any>;
    viewEmployeePendingLeaveByUserId(req: any, userId: any, limit: any, skip: any): Promise<any>;
    viewEmployeePendingLeave(req: any, userId: string, Status: string, limit: any, skip: any): Promise<any>;
    approveEmployeeLeaves(userId: string, date: string, req: any): Promise<any>;
    rejectEmployeeLeaves(userId: string, date: string, req: any): Promise<any>;
}
