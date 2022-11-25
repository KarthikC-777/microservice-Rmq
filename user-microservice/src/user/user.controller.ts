import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { EmployeeDto } from './dto/employee.dto';
import { forgotDto } from './dto/forgot.dto';
import { loginDto } from './dto/login.dto';
import { resetDto } from './dto/reset.dto';
import { UpdateDto } from './dto/update.dto';
import { UserDto } from './dto/user.dto';
import { Roles } from './entities/roles.decorator';
import { UserRole } from './user.schema';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { leaveDto } from './dto/leave.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiGoneResponse,
  ApiInternalServerErrorResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from './dto/pagination.dto';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  //For registering employee Input:json{name,email,address,password}
  @Post('register')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary:"Register a new Employee"})
  @ApiInternalServerErrorResponse({ description: "Internal Server Error"})
  @ApiCreatedResponse({ description: 'User Registered Successfully' })
  @ApiNotFoundResponse({ description: 'Designation Not Found' })
  @ApiConflictResponse({ description: 'Email already taken' })
  async signup(@Res() res, @Body() userDto: UserDto) {
    res.status(HttpStatus.CREATED).json({
      message: 'Successfully Registered',
      result: await this.userService.signup(userDto),
    });
  }

  //For login Input:json{email,password}
  @Post('login')
  @ApiOperation({ summary:"Employee Login"})
  @ApiOkResponse({ description: 'User Logged in' })
  @ApiForbiddenResponse({ description: 'You are already signed In' })
  @ApiNotFoundResponse({ description: 'Employee Not found' })
  @ApiBadRequestResponse({ description: 'Incorrect Password' })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error"})
  async signin(@Req() req, @Res() res, @Body() userDto: loginDto) {
    res.status(HttpStatus.OK).json({
      message: 'Signed in Succesfully',
      JWT: await this.userService.signin(req, userDto, res),
    });
  }

  //For Logout
  @Delete('logout')
  @ApiOperation({ summary:"Employee Logout"})
  @ApiOkResponse({ description: 'User logged out successfully' })
  @ApiForbiddenResponse({ description: 'You are already signed out' })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error"})
  public async signout(@Req() req, @Res() res) {
    return this.userService.signout(req, res);
  }

  //access:admin, For getting all employee details
  @Get('employee')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary:"Getting all employee details or Individual employee detail (Admin Access)"})
  @ApiOkResponse({ description: 'All the employee details listed below' })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error"})
  async getEmployee(@Req() req, @Res() res, @Query() userId: string) {
    res.status(HttpStatus.OK).json({
      message: 'Employee Details:',
      result: await this.userService.getEmployee(req, userId),
    });
  }

  //access:admin update employee details Input:json{userId,salary,designation}
  @Patch('update-employee/:userId')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary:"Update employee details {userId,salary,designation} (Admin Access)"})
  @ApiOkResponse({ description: 'Employee Details Updated' })
  @ApiNotFoundResponse({ description: 'Designation Not Found' })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error"})
  async updateEmployee(
    @Req() req,
    @Res() res,
    @Param('userId') userId: string,
    @Body() userDto: UpdateDto,
  ) {
    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: `Employee ${userId} updated`,
      result: await this.userService.updateEmployee(req, res, userId, userDto),
    });
  }

  //update employee details Input:json{name,email,address,phonenumber}
  @Patch('update-employee-user')
  @ApiOperation({ summary:"Update employee details {name,email,address,phonenumber} (User Access)"})
  @ApiOkResponse({ description: 'Employee Details Updated' })
  @ApiNotFoundResponse({ description: 'Invalid User Email' })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error"})
  async updateOwnInfo(
    @Req() req,
    @Res() res,
    @Body() employeeDto: EmployeeDto,
  ) {
    res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: `Employee  updated`,
      result: await this.userService.updateOwnInfo(req, res, employeeDto),
    });
  }

  //For getting resetpassword link Input:json{email}
  @Post('forgot-password')
  @ApiOperation({ summary: "Forgot Password (For getting reset password link Input {email})"})
  @ApiNotFoundResponse({ description: 'Email does not exist' })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error"})
  public async forgotPassword(@Body() body: forgotDto, @Req() req, @Res() res) {
    res.send(await this.userService.forgotPassword(body, req, res));
  }

  //For changing password Input:json{email, password}
  @Put('reset-password')
  @ApiOperation({ summary: "Reset Password (For changing password Input {email, password})"})
  @ApiInternalServerErrorResponse({ description: "Internal Server Error"})
  public async resetPassword(
    @Body() body: resetDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: { resetId: string },
  ) {
    this.userService.resetPassword(body, req, res, query);
  }

  //access:admin soft deleting the user/employee
  @Patch('delete-user/:userId')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: "Disable/Soft Delete a particular employee (Admin Access)"})
  @ApiOkResponse({ description: 'User Disabled' })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error"})
  @ApiForbiddenResponse({ description: 'User is already disabled' })
  async deactivateEmployee(
    @Req() req,
    @Res() res,
    @Param('userId') userId: string,
  ) {
    res.status(HttpStatus.OK).json({
      message: 'User Deleted',
      result: await this.userService.deactivateEmployee(userId, req),
    });
  }

  //access:admin activating the user/employee
  @Patch('activate-user/:userId')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: "Enable/Activate a particular employee (Admin Access)"})
  @ApiOkResponse({ description: 'User Activated' })
  @ApiForbiddenResponse({ description: 'User Account is already active' })
  @ApiInternalServerErrorResponse({ description: "Internal Server Error"})
  async activateEmployee(
    @Req() req,
    @Res() res,
    @Param('userId') userId: string,
  ) {
    res.status(HttpStatus.OK).json({
      message: 'User Activated',
      result: await this.userService.activateEmployee(userId, req),
    });
  }

  // For applying leave Input:json{leaveDate:"YYYY-MM-DD"}
  @Post('apply-leave')
  @ApiOperation({ summary: "Apply Leave Input {leaveDate:YYYY-MM-DD}"})
  @ApiInternalServerErrorResponse({ description: "Internal Server Error"})
  @ApiCreatedResponse({ description: 'Leave applied successfully' })
  @ApiBadRequestResponse({
    description: 'leaveDate must be in the format yyyy-mm-dd',
  })
  @ApiNotAcceptableResponse({
    description: 'Cannot apply leave for older dates or No leaves available',
  })
  async applyLeave(@Req() req, @Body() leaveDto: leaveDto) {
    return await this.userService.applyLeave(req, leaveDto);
  }

  //For fetching employee his own leave status
  @Get('check-status')
  @ApiOperation({ summary: "Employee fetching there own leave status"})
  @ApiInternalServerErrorResponse({ description: "Internal Server Error"})
  @ApiOkResponse({ description: 'Own Leaves' })
  @ApiNotFoundResponse({ description: 'Invalid User' })
  async viewOwnLeave(@Req() req, @Query() { limit, skip }: PaginationDto) {
    return this.userService.viewOwnLeave(req, limit, skip);
  }

  @Get('check-own-details')
  @ApiOperation({ summary: "Employee fetching there own details"})
  @ApiInternalServerErrorResponse({ description: "Internal Server Error"})
  @ApiOkResponse({ description: 'Details' })
  @ApiNotFoundResponse({ description: 'Invalid User' })
  async viewOwnDetails(@Req() req, @Res() res) {
    return this.userService.viewOwnDetails(req, res);
  }

  //access:admin fetching pending leaves by user Id
  @Get('view-leaves')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: "Fetching all the pending leaves by User ID (Admin Access)"})
  @ApiInternalServerErrorResponse({ description: "Internal Server Error"})
  @ApiOkResponse({ description: 'Pending Leaves' })
  @ApiNotFoundResponse({ description: 'No pending leaves or Invalid user Id' })
  async viewEmployeePendingLeaveByUserId(
    @Req() req,
    @Query() { userId, status, limit, skip }: PaginationDto,
  ) {
    if (userId && status) {
      return this.userService.viewEmployeePendingLeave(
        req,
        userId,
        status,
        limit,
        skip,
      );
    }
    if (userId) {
      return this.userService.viewEmployeePendingLeaveByUserId(
        req,
        userId,
        limit,
        skip,
      );
    }
    if (status) {
      return this.userService.viewEmployeePendingLeave(
        req,
        userId,
        status,
        limit,
        skip,
      );
    }
    return this.userService.viewEmployeePendingLeaveByUserId(
      req,
      userId,
      limit,
      skip,
    );
  }

  //access:admin For approving employee leaves
  @Patch('approve-leaves')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: "Approving pending leaves (Admin access)"})
  @ApiInternalServerErrorResponse({ description: "Internal Server Error"})
  @ApiCreatedResponse({ description: 'Leave Approved' })
  async approveEmployeeLeaves(
    @Req() req,
    @Query() query: { leaveDate: string; userId: string },
  ) {
    return await this.userService.approveEmployeeLeaves(
      query.userId,
      query.leaveDate,
      req,
    );
  }

  //access:admin For rejecting employee leaves
  @Patch('reject-leaves')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: "Rejecting pending leaves (Admin access)"})
  @ApiInternalServerErrorResponse({ description: "Internal Server Error"})
  @ApiCreatedResponse({ description: 'Leave Rejected' })
  @ApiGoneResponse({ description: 'Link Expired' })
  async rejectEmployeeLeaves(
    @Req() req,
    @Query() query: { leaveDate: string; userId: string },
  ) {
    return await this.userService.rejectEmployeeLeaves(
      query.userId,
      query.leaveDate,
      req,
    );
  }
}
