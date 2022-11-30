import { HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { leaveDocument } from './leave.schema';
import { leaveDto } from 'src/dto/leave.dto';
import { Cache } from 'cache-manager';
export declare class LeaveService {
    private readonly leaveModel;
    private readonly cacheManager;
    constructor(leaveModel: Model<leaveDocument>, cacheManager: Cache);
    applyLeave(data: leaveDto): Promise<any>;
    checkEmployeeLeave(limitOfDocs?: number, toSkip?: number): Promise<any>;
    viewOwnLeave(data: leaveDto, limitOfDocs?: number, toSkip?: number): Promise<{
        message: string;
        result: (import("mongoose").Document<unknown, any, leaveDocument> & import("./leave.schema").leave & Document & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        status: HttpStatus;
        error: string;
        statusCode?: undefined;
    } | {
        statusCode: any;
        message: any;
        result: any;
        error: any;
        status?: undefined;
    }>;
    viewEmployeePendingLeaveByUserId(data: leaveDto, limitOfDocs?: number, toSkip?: number): Promise<any>;
    viewEmployeePendingLeave(data: leaveDto, limitOfDocs?: number, toSkip?: number): Promise<any>;
    approveEmployeeLeaves(data: leaveDto): Promise<any>;
    rejectEmployeeLeaves(data: leaveDto): Promise<any>;
}
