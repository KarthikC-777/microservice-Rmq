import { Controller, Get } from '@nestjs/common';
import { LeaveService } from './leave.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { leaveDto } from '../dto/leave.dto';

@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @MessagePattern({ cmd: 'applyLeave' })
  async applyLeave(@Payload() data: leaveDto, @Ctx() Context: RmqContext) {
    const channel = Context.getChannelRef();
    const originalMessage = Context.getMessage();
    channel.ack(originalMessage);
    return await this.leaveService.applyLeave(data);
  }

  @MessagePattern({ cmd: 'checkEmployeeLeave' })
  async checkEmployeeLeave(data: leaveDto,@Ctx() Context: RmqContext) {
    const channel = Context.getChannelRef();
    const originalMessage = Context.getMessage();
    channel.ack(originalMessage);
    return {
      message: 'details',
      result: await this.leaveService.checkEmployeeLeave(data.limit,data.skip),
    };
  }

  @MessagePattern({ cmd: 'viewOwnLeave' })
  async viewOwnLeave(@Payload() data: leaveDto, @Ctx() Context: RmqContext) {
    const channel = Context.getChannelRef();
    const originalMessage = Context.getMessage();
    channel.ack(originalMessage);
    return await this.leaveService.viewOwnLeave(data,data.limit,data.skip);
  }

  @MessagePattern({ cmd: 'viewEmployeePendingLeaveByEmail' })
  async viewEmployeePendingLeaveByEmail(
    @Payload() data: leaveDto,
    @Ctx() Context: RmqContext,
  ) {
    const channel = Context.getChannelRef();
    const originalMessage = Context.getMessage();
    channel.ack(originalMessage);
    return await this.leaveService.viewEmployeePendingLeaveByEmail(data,data.limit,data.skip);
  }

  @MessagePattern({ cmd: 'viewEmployeePendingLeave' })
  async viewEmployeePendingLeave(
    @Payload() data: leaveDto,
    @Ctx() Context: RmqContext,
  ) {
    const channel = Context.getChannelRef();
    const originalMessage = Context.getMessage();
    channel.ack(originalMessage);
    return await this.leaveService.viewEmployeePendingLeave(data,data.limit,data.skip);
  }

  @MessagePattern({ cmd: 'approveEmployeeLeaves' })
  async approveEmployeeLeaves(
    @Payload() data: leaveDto,
    @Ctx() Context: RmqContext,
  ) {
    const channel = Context.getChannelRef();
    const originalMessage = Context.getMessage();
    channel.ack(originalMessage);
    return await this.leaveService.approveEmployeeLeaves(data);
  }

  @MessagePattern({ cmd: 'rejectEmployeeLeaves' })
  async rejectEmployeeLeaves(
    @Payload() data: leaveDto,
    @Ctx() Context: RmqContext,
  ) {
    const channel = Context.getChannelRef();
    const originalMessage = Context.getMessage();
    channel.ack(originalMessage);
    return await this.leaveService.rejectEmployeeLeaves(data);
  }

  @Get()
  async leaveServiceFunction() {
    return 'hi';
  }
}
