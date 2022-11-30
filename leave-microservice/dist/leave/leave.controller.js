"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveController = void 0;
const common_1 = require("@nestjs/common");
const leave_service_1 = require("./leave.service");
const microservices_1 = require("@nestjs/microservices");
const leave_dto_1 = require("../dto/leave.dto");
let LeaveController = class LeaveController {
    constructor(leaveService) {
        this.leaveService = leaveService;
    }
    async applyLeave(data, Context) {
        const channel = Context.getChannelRef();
        const originalMessage = Context.getMessage();
        const result = await this.leaveService.applyLeave(data);
        channel.ack(originalMessage);
        return result;
    }
    async checkEmployeeLeave(data, Context) {
        const channel = Context.getChannelRef();
        const originalMessage = Context.getMessage();
        channel.ack(originalMessage);
        return {
            message: 'details',
            result: await this.leaveService.checkEmployeeLeave(data.limit, data.skip),
        };
    }
    async viewOwnLeave(data, Context) {
        const channel = Context.getChannelRef();
        const originalMessage = Context.getMessage();
        const result = await this.leaveService.viewOwnLeave(data, data.limit, data.skip);
        channel.ack(originalMessage);
        return result;
    }
    async viewEmployeePendingLeaveByUserId(data, Context) {
        const channel = Context.getChannelRef();
        const originalMessage = Context.getMessage();
        const result = await this.leaveService.viewEmployeePendingLeaveByUserId(data, data.limit, data.skip);
        channel.ack(originalMessage);
        return result;
    }
    async viewEmployeePendingLeave(data, Context) {
        const channel = Context.getChannelRef();
        const originalMessage = Context.getMessage();
        const result = await this.leaveService.viewEmployeePendingLeave(data, data.limit, data.skip);
        channel.ack(originalMessage);
        return result;
    }
    async approveEmployeeLeaves(data, Context) {
        const channel = Context.getChannelRef();
        const originalMessage = Context.getMessage();
        const result = await this.leaveService.approveEmployeeLeaves(data);
        channel.ack(originalMessage);
        return result;
    }
    async rejectEmployeeLeaves(data, Context) {
        const channel = Context.getChannelRef();
        const originalMessage = Context.getMessage();
        const result = await this.leaveService.rejectEmployeeLeaves(data);
        channel.ack(originalMessage);
        return result;
    }
    async leaveServiceFunction() {
        return 'hi';
    }
};
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'applyLeave' }),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_dto_1.leaveDto, microservices_1.RmqContext]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "applyLeave", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'checkEmployeeLeave' }),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_dto_1.leaveDto, microservices_1.RmqContext]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "checkEmployeeLeave", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'viewOwnLeave' }),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_dto_1.leaveDto, microservices_1.RmqContext]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "viewOwnLeave", null);
__decorate([
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_dto_1.leaveDto,
        microservices_1.RmqContext]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "viewEmployeePendingLeaveByUserId", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'viewEmployeePendingLeave' }),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_dto_1.leaveDto,
        microservices_1.RmqContext]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "viewEmployeePendingLeave", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'approveEmployeeLeaves' }),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_dto_1.leaveDto,
        microservices_1.RmqContext]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "approveEmployeeLeaves", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'rejectEmployeeLeaves' }),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_dto_1.leaveDto,
        microservices_1.RmqContext]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "rejectEmployeeLeaves", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "leaveServiceFunction", null);
LeaveController = __decorate([
    (0, common_1.UseInterceptors)(common_1.CacheInterceptor),
    (0, common_1.Controller)('leave'),
    __metadata("design:paramtypes", [leave_service_1.LeaveService])
], LeaveController);
exports.LeaveController = LeaveController;
//# sourceMappingURL=leave.controller.js.map