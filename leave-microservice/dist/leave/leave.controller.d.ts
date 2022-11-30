import { LeaveService } from './leave.service';
import { RmqContext } from '@nestjs/microservices';
import { leaveDto } from '../dto/leave.dto';
export declare class LeaveController {
    private readonly leaveService;
    constructor(leaveService: LeaveService);
    applyLeave(data: leaveDto, Context: RmqContext): Promise<any>;
    checkEmployeeLeave(data: leaveDto, Context: RmqContext): Promise<{
        message: string;
        result: any;
    }>;
    viewOwnLeave(data: leaveDto, Context: RmqContext): Promise<{
        message: string;
        result: (import("mongoose").Document<unknown, any, import("./leave.schema").leaveDocument> & import("./leave.schema").leave & Document & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        status: import("@nestjs/common").HttpStatus;
        error: string;
        statusCode?: undefined;
    } | {
        statusCode: any;
        message: any;
        result: any;
        error: any;
        status?: undefined;
    }>;
    viewEmployeePendingLeaveByUserId(data: leaveDto, Context: RmqContext): Promise<any>;
    viewEmployeePendingLeave(data: leaveDto, Context: RmqContext): Promise<any>;
    approveEmployeeLeaves(data: leaveDto, Context: RmqContext): Promise<any>;
    rejectEmployeeLeaves(data: leaveDto, Context: RmqContext): Promise<any>;
    leaveServiceFunction(): Promise<string>;
}
