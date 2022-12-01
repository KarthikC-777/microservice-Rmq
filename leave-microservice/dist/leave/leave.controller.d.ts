/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
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
    } | {
        status: any;
        message: any;
        result?: undefined;
    }>;
    viewEmployeePendingLeaveByUserId(data: leaveDto, Context: RmqContext): Promise<any>;
    viewEmployeePendingLeave(data: leaveDto, Context: RmqContext): Promise<any>;
    approveEmployeeLeaves(data: leaveDto, Context: RmqContext): Promise<any>;
    rejectEmployeeLeaves(data: leaveDto, Context: RmqContext): Promise<any>;
    leaveServiceFunction(): Promise<string>;
}
