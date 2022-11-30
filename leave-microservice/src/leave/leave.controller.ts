import {
  CacheInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { leaveDto } from '../dto/leave.dto';

@UseInterceptors(CacheInterceptor)
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @MessagePattern({ cmd: 'applyLeave' })
  async applyLeave(@Payload() data: leaveDto, @Ctx() Context: RmqContext) {
    const channel = Context.getChannelRef();
    const originalMessage = Context.getMessage();
    const result = await this.leaveService.applyLeave(data);
    channel.ack(originalMessage);
    return result;
  }

  @MessagePattern({ cmd: 'checkEmployeeLeave' })
  async checkEmployeeLeave(data: leaveDto, @Ctx() Context: RmqContext) {
    const channel = Context.getChannelRef();
    const originalMessage = Context.getMessage();
    channel.ack(originalMessage);
    return {
      message: 'details',
      result: await this.leaveService.checkEmployeeLeave(data.limit, data.skip),
    };
  }

  @MessagePattern({ cmd: 'viewOwnLeave' })
  async viewOwnLeave(@Payload() data: leaveDto, @Ctx() Context: RmqContext) {
    const channel = Context.getChannelRef();
    const originalMessage = Context.getMessage();
    const result = await this.leaveService.viewOwnLeave(
      data,
      data.limit,
      data.skip,
    );
    channel.ack(originalMessage);
    return result;
  }

  async viewEmployeePendingLeaveByUserId(
    @Payload() data: leaveDto,
    @Ctx() Context: RmqContext,
  ) {
    const channel = Context.getChannelRef();
    const originalMessage = Context.getMessage();
    const result = await this.leaveService.viewEmployeePendingLeaveByUserId(
      data,
      data.limit,
      data.skip,
    );
    channel.ack(originalMessage);
    return result;
  }

  @MessagePattern({ cmd: 'viewEmployeePendingLeave' })
  async viewEmployeePendingLeave(
    @Payload() data: leaveDto,
    @Ctx() Context: RmqContext,
  ) {
    const channel = Context.getChannelRef();
    const originalMessage = Context.getMessage();
    const result = await this.leaveService.viewEmployeePendingLeave(
      data,
      data.limit,
      data.skip,
    );
    channel.ack(originalMessage);
    return result;
  }

  @MessagePattern({ cmd: 'approveEmployeeLeaves' })
  async approveEmployeeLeaves(
    @Payload() data: leaveDto,
    @Ctx() Context: RmqContext,
  ) {
    const channel = Context.getChannelRef();
    const originalMessage = Context.getMessage();
    const result = await this.leaveService.approveEmployeeLeaves(data);
    channel.ack(originalMessage);
    return result;
  }

  @MessagePattern({ cmd: 'rejectEmployeeLeaves' })
  async rejectEmployeeLeaves(
    @Payload() data: leaveDto,
    @Ctx() Context: RmqContext,
  ) {
    const channel = Context.getChannelRef();
    const originalMessage = Context.getMessage();
    const result = await this.leaveService.rejectEmployeeLeaves(data);
    channel.ack(originalMessage);
    return result;
  }
  @Get()
  async leaveServiceFunction() {
    return 'hi';
  }
}
