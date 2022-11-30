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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./user.schema");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
const userProjection = {
    __v: false,
    _id: false,
    approveLink: false,
    rejectLink: false,
    password: false,
    resetToken: false,
};
let UserService = class UserService {
    constructor(userModel, jwtService, leaveClient, cacheManager) {
        this.userModel = userModel;
        this.jwtService = jwtService;
        this.leaveClient = leaveClient;
        this.cacheManager = cacheManager;
        this.functionVerify = async (token) => {
            try {
                if (token === undefined) {
                    throw new common_1.HttpException('Please Login Again ', common_1.HttpStatus.NOT_FOUND);
                }
                const verifyUser = await this.jwtService.verify(token);
                if (!verifyUser) {
                    throw new common_1.HttpException('Unauthorized  User error ', common_1.HttpStatus.UNAUTHORIZED);
                }
                return verifyUser;
            }
            catch (error) {
                throw new common_1.HttpException(error.message, error.status);
            }
        };
    }
    async signup(userDto) {
        try {
            let formatError = {};
            const designationKey = Object.keys(user_schema_1.UserDesignation).find((key) => key === userDto.designation);
            if (designationKey === undefined) {
                formatError = {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Provide proper designation, Valid Designation: ASE,SE,SSE,EM,BD',
                    result: [],
                    error: 'Bad Request',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
            }
            const existingUser = await this.userModel.findOne({
                email: userDto.email,
            });
            if (existingUser) {
                formatError = {
                    statusCode: common_1.HttpStatus.CONFLICT,
                    message: 'Email already taken',
                    result: [],
                    error: 'CONFLICT',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.CONFLICT);
            }
            const createdUser = new this.userModel(userDto);
            const salt = await bcrypt.genSalt();
            createdUser.password = await bcrypt.hash(createdUser.password, salt);
            createdUser.designation = user_schema_1.UserDesignation[userDto.designation];
            const noOfDocuments = await this.userModel.find();
            createdUser['userId'] =
                'YML' + String(noOfDocuments.length + 1).padStart(3, '0');
            await createdUser.save();
            const filterOutput = await this.userModel.find({ email: userDto.email }, userProjection);
            return filterOutput;
        }
        catch (error) {
            throw new common_1.HttpException(error.response, error.status);
        }
    }
    async signin(req, userDto, res) {
        try {
            let formatError = {};
            if (req.cookies['userlogoutcookie'] !== undefined) {
                const checkAlredySignin = await this.functionVerify(req.cookies['userlogoutcookie']);
                if (checkAlredySignin.Email === userDto.email) {
                    formatError = {
                        statusCode: common_1.HttpStatus.CONFLICT,
                        message: 'You are already signed In',
                        result: [],
                        error: 'CONFLICT',
                    };
                    throw new common_1.HttpException(formatError, common_1.HttpStatus.CONFLICT);
                }
            }
            const checkUser = await this.userModel.findOne({
                email: userDto.email,
            });
            if (!checkUser) {
                formatError = {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Incorrect Email',
                    result: [],
                    error: 'BAD_REQUEST',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
            }
            if (checkUser.status == false) {
                formatError = {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Account Deactivated',
                    result: [],
                    error: 'BAD_REQUEST',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
            }
            const passwordCheck = await bcrypt.compare(userDto.password, checkUser.password);
            if (!passwordCheck) {
                formatError = {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Incorrect Password',
                    result: [],
                    error: 'BAD_REQUEST',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
            }
            const token = this.generateJwt(checkUser.userId, checkUser.name, checkUser.email, checkUser.role);
            res.cookie('userlogoutcookie', token);
            return { accessToken: token };
        }
        catch (error) {
            throw new common_1.HttpException(error.response, error.status);
        }
    }
    generateJwt(userId, name, email, role) {
        return this.jwtService.sign({
            userId: userId,
            Name: name,
            Email: email,
            role: role,
        });
    }
    async signout(req, res) {
        try {
            let formatError = {};
            if (req.cookies['userlogoutcookie'] === undefined) {
                formatError = {
                    statusCode: common_1.HttpStatus.CONFLICT,
                    message: 'You are already signed Out',
                    result: [],
                    error: 'CONFLICT',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.CONFLICT);
            }
            res.clearCookie('userlogoutcookie');
            res.status(common_1.HttpStatus.OK).send({
                statusCode: common_1.HttpStatus.OK,
                message: 'User signed out successfully',
                result: [],
                error: 'No Error',
            });
        }
        catch (error) {
            throw new common_1.HttpException(error.response, error.status);
        }
    }
    async getEmployee(req, user, limitOfDocs = 0, toSkip = 0) {
        try {
            await this.functionVerify(req.cookies['userlogoutcookie']);
            if (user) {
                return this.userModel.findOne({ userId: user }, userProjection).exec();
            }
            return this.userModel
                .find({}, userProjection)
                .skip(toSkip)
                .limit(limitOfDocs)
                .exec();
        }
        catch (error) {
            throw new common_1.HttpException(error.message, error.status);
        }
    }
    async updateEmployee(req, res, userId, userDto) {
        try {
            let formatError = {};
            if (userDto.designation) {
                const designationKey = Object.keys(user_schema_1.UserDesignation).find((key) => key === userDto.designation);
                if (designationKey === undefined) {
                    formatError = {
                        statusCode: common_1.HttpStatus.BAD_REQUEST,
                        message: 'Provide proper designation, Valid Designation: ASE,SE,SSE,EM,BD',
                        result: [],
                        error: 'Bad Request',
                    };
                    throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
                }
            }
            await this.functionVerify(req.cookies['userlogoutcookie']);
            const existUser = await this.userModel.findOneAndUpdate({ userId: userId }, {
                name: userDto.name,
                phonenumber: userDto.phonenumber,
                salary: userDto.salary,
                designation: user_schema_1.UserDesignation[userDto.designation],
                address: userDto.address,
                availableLeaves: userDto.availableLeaves,
            });
            if (!existUser) {
                formatError = {
                    statusCode: common_1.HttpStatus.NON_AUTHORITATIVE_INFORMATION,
                    message: 'Invalid User Id',
                    result: [],
                    error: 'NON_AUTHORITATIVE_INFORMATION',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.NON_AUTHORITATIVE_INFORMATION);
            }
            const filterOutput = await this.userModel.find({ userId: userId }, userProjection);
            return filterOutput;
        }
        catch (error) {
            throw new common_1.HttpException(error.response, error.status);
        }
    }
    async updateOwnInfo(req, res, employeeDto) {
        try {
            let formatError = {};
            const verifyUser = await this.functionVerify(req.cookies['userlogoutcookie']);
            const existUser = await this.userModel.findOneAndUpdate({ userId: verifyUser.userId }, {
                name: employeeDto.name,
                phonenumber: employeeDto.phonenumber,
                address: employeeDto.address,
            });
            if (!existUser) {
                formatError = {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Invalid UserId',
                    result: [],
                    error: 'Bad Request',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
            }
            const filterOutput = await this.userModel.find({ userId: verifyUser.userId }, userProjection);
            return filterOutput;
        }
        catch (error) {
            throw new common_1.HttpException(error.response, error.status);
        }
    }
    async viewOwnDetails(req, res) {
        try {
            let formatError = {};
            const verifyUser = await this.functionVerify(req.cookies['userlogoutcookie']);
            const existUser = await this.userModel
                .find({
                userId: verifyUser.userId,
            }, userProjection)
                .exec();
            if (!existUser) {
                formatError = {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Invalid UserId',
                    result: [],
                    error: 'Bad Request',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
            }
            res.status(common_1.HttpStatus.OK).json({
                statusCode: common_1.HttpStatus.OK,
                message: `Details of ${verifyUser.userId} user with status `,
                result: existUser,
                error: 'No Error',
            });
        }
        catch (error) {
            throw new common_1.HttpException(error.response, error.status);
        }
    }
    async forgotPassword(body, req, res) {
        try {
            let formatError = {};
            const user = await this.userModel.findOne({ email: body.email });
            if (!user) {
                formatError = {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Incorrect Email',
                    result: [],
                    error: 'BAD_REQUEST',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
            }
            const salt = await bcrypt.genSalt();
            const resetHash = await bcrypt.hash((0, crypto_1.randomBytes)(32).toString('hex'), salt);
            await this.userModel.updateOne({ email: body.email }, { resetToken: resetHash });
            res.json({
                link: `http://localhost:3000/users/reset-password?resetId=${resetHash}`,
            });
        }
        catch (error) {
            throw new common_1.HttpException(error.response, error.status);
        }
    }
    async resetPassword(body, req, res, query) {
        try {
            this.userModel.findOne({ resetToken: query.resetId }, async (error, data) => {
                if (error)
                    throw error;
                const salt = await bcrypt.genSalt();
                const newPassword = await bcrypt.hash(body.password, salt);
                await this.userModel.updateOne({ resetToken: query.resetId }, { password: newPassword, resetToken: 0 });
                res.json({
                    statusCode: common_1.HttpStatus.OK,
                    message: 'password updated successfuly, Login again',
                    result: [],
                    error: 'No Error',
                });
            });
        }
        catch (error) {
            throw new common_1.HttpException(error.message, error.status);
        }
    }
    async deactivateEmployee(userId, req) {
        try {
            let formatError = {};
            await this.functionVerify(req.cookies['userlogoutcookie']);
            const existUser = await this.userModel.findOne({ userId: userId });
            if (!existUser) {
                formatError = {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Invalid UserId',
                    result: [],
                    error: 'Bad Request',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
            }
            if (existUser.status === false) {
                formatError = {
                    statusCode: common_1.HttpStatus.FORBIDDEN,
                    message: 'Account is already deactivated ',
                    result: [],
                    error: 'FORBIDDEN',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.FORBIDDEN);
            }
            existUser.status = false;
            existUser.save();
            const filterOutput = await this.userModel.find({ userId: userId }, userProjection);
            return filterOutput;
        }
        catch (error) {
            throw new common_1.HttpException(error.response, error.status);
        }
    }
    async activateEmployee(userId, req) {
        try {
            let formatError = {};
            await this.functionVerify(req.cookies['userlogoutcookie']);
            const existUser = await this.userModel.findOne({ userId: userId });
            if (!existUser) {
                formatError = {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Invalid UserId',
                    result: [],
                    error: 'Bad Request',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
            }
            if (existUser.status === true) {
                formatError = {
                    statusCode: common_1.HttpStatus.FORBIDDEN,
                    message: 'Account is already active ',
                    result: [],
                    error: 'FORBIDDEN',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.FORBIDDEN);
            }
            existUser.status = true;
            existUser.save();
            const filterOutput = this.userModel.find({ userId: userId }, userProjection);
            return filterOutput;
        }
        catch (error) {
            throw new common_1.HttpException(error.response, error.status);
        }
    }
    async applyLeave(req, leaveDto) {
        try {
            let formatError = {};
            const verifyUser = await this.functionVerify(req.cookies['userlogoutcookie']);
            if ('status' in leaveDto) {
                formatError = {
                    statusCode: common_1.HttpStatus.FORBIDDEN,
                    message: ' `Status` access in forbidden',
                    result: [],
                    error: 'FORBIDDEN',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.FORBIDDEN);
            }
            const user = await this.userModel
                .findOne({ email: verifyUser.Email })
                .exec();
            if (!new Date(leaveDto.leaveDate).getTime() ||
                leaveDto.leaveDate.length < 10) {
                formatError = {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: ' `leaveDate` must be in the format yyyy-mm-dd',
                    result: [],
                    error: 'BAD_REQUEST',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
            }
            const newDate = new Date(leaveDto.leaveDate);
            if (newDate.getTime() < Date.now() || user.availableLeaves < 1) {
                formatError = {
                    statusCode: common_1.HttpStatus.NOT_ACCEPTABLE,
                    message: 'Cannot apply leave for older dates or No leaves available',
                    result: [],
                    error: 'NOT_ACCEPTABLE',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.NOT_ACCEPTABLE);
            }
            const pattern = { cmd: 'applyLeave' };
            const payload = {
                email: verifyUser.Email,
                userId: user.userId,
                leaveDate: leaveDto.leaveDate,
            };
            return this.leaveClient.send(pattern, payload).pipe((0, rxjs_1.map)((output) => {
                if (output.status !== common_1.HttpStatus.OK) {
                    formatError = {
                        statusCode: output.statusCode,
                        message: output.message,
                        result: output.result,
                        error: output.error,
                    };
                    throw new common_1.HttpException(formatError, output.statusCode);
                }
                else {
                    return {
                        statusCode: output.statusCode,
                        message: output.message,
                        result: output.result,
                        error: output.error,
                    };
                }
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.response, error.status);
        }
    }
    async checkEmployeeLeave(req, limit, skip) {
        try {
            await this.functionVerify(req.cookies['userlogoutcookie']);
            const pattern = { cmd: 'checkEmployeeLeave' };
            const payload = { limit: limit, skip: skip };
            return this.leaveClient.send(pattern, payload);
        }
        catch (error) {
            throw new common_1.HttpException(error.response, error.status);
        }
    }
    async viewOwnLeave(req, limit, skip) {
        try {
            let formatError = {};
            const verifyUser = await this.functionVerify(req.cookies['userlogoutcookie']);
            const pattern = { cmd: 'viewOwnLeave' };
            const payload = {
                email: verifyUser.Email,
                limit: limit,
                skip: skip,
            };
            return this.leaveClient.send(pattern, payload).pipe((0, rxjs_1.map)((output) => {
                if (output.status !== common_1.HttpStatus.OK) {
                    formatError = {
                        statusCode: output.statusCode,
                        message: output.message,
                        result: output.result,
                        error: output.error,
                    };
                    throw new common_1.HttpException(formatError, output.statusCode);
                }
                else {
                    return {
                        statusCode: output.statusCode,
                        message: output.message,
                        result: output.result,
                        error: output.error,
                    };
                }
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.response, error.status);
        }
    }
    async viewEmployeePendingLeaveByUserId(req, userId, limit, skip) {
        try {
            let formatError = {};
            await this.functionVerify(req.cookies['userlogoutcookie']);
            if (userId) {
                const existUser = await this.userModel.findOne({ userId: userId });
                if (!existUser) {
                    formatError = {
                        statusCode: common_1.HttpStatus.BAD_REQUEST,
                        message: 'Invalid UserId',
                        result: [],
                        error: 'Bad Request',
                    };
                    throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
                }
            }
            const pattern = { cmd: 'viewEmployeePendingLeaveByUserId' };
            const payload = { userId: userId, limit: limit, skip: skip };
            return this.leaveClient.send(pattern, payload).pipe((0, rxjs_1.map)((output) => {
                if (output.statusCode !== common_1.HttpStatus.OK) {
                    formatError = {
                        statusCode: output.statusCode,
                        message: output.message,
                        result: output.result,
                        link: output.links,
                        error: output.error,
                    };
                    throw new common_1.HttpException(formatError, output.statusCode);
                }
                else {
                    return {
                        statusCode: output.statusCode,
                        message: output.message,
                        result: output.result,
                        links: output.links,
                        error: output.error,
                    };
                }
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.response, error.status);
        }
    }
    async viewEmployeePendingLeave(req, userId, Status, limit, skip) {
        try {
            let formatError = {};
            await this.functionVerify(req.cookies['userlogoutcookie']);
            if (userId) {
                const existUser = await this.userModel.findOne({ userId: userId });
                if (!existUser) {
                    formatError = {
                        statusCode: common_1.HttpStatus.BAD_REQUEST,
                        message: 'Invalid UserId',
                        result: [],
                        error: 'Bad Request',
                    };
                    throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
                }
            }
            const pattern = { cmd: 'viewEmployeePendingLeave' };
            const payload = {
                userId: userId,
                status: Status,
                limit: limit,
                skip: skip,
            };
            return this.leaveClient.send(pattern, payload).pipe((0, rxjs_1.map)((output) => {
                if (output.status !== common_1.HttpStatus.OK) {
                    formatError = {
                        statusCode: output.statusCode,
                        message: output.message,
                        result: output.result,
                        link: output.links,
                        error: output.error,
                    };
                    throw new common_1.HttpException(formatError, output.statusCode);
                }
                else {
                    return {
                        statusCode: output.statusCode,
                        message: output.message,
                        result: output.result,
                        links: output.links,
                        error: output.error,
                    };
                }
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.response, error.status);
        }
    }
    async approveEmployeeLeaves(userId, date, req) {
        try {
            await this.functionVerify(req.cookies['userlogoutcookie']);
            const emp = await this.userModel.findOne({
                userId: userId,
            });
            const pattern = { cmd: 'approveEmployeeLeaves' };
            const payload = { userId: userId, date: date };
            return this.leaveClient.send(pattern, payload).pipe((0, rxjs_1.map)((output) => {
                if (output.status === common_1.HttpStatus.OK) {
                    emp.availableLeaves = emp.availableLeaves - 1;
                    emp.save();
                    return {
                        status: output.status,
                        message: output.message,
                    };
                }
                else {
                    throw new common_1.HttpException(output.message, output.status);
                }
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message, error.status);
        }
    }
    async rejectEmployeeLeaves(userId, date, req) {
        try {
            await this.functionVerify(req.cookies['userlogoutcookie']);
            const pattern = { cmd: 'rejectEmployeeLeaves' };
            const payload = { userId: userId, date: date };
            return this.leaveClient.send(pattern, payload).pipe((0, rxjs_1.map)((output) => {
                if (output.status === common_1.HttpStatus.OK) {
                    return {
                        status: output.status,
                        message: output.message,
                    };
                }
                else {
                    throw new common_1.HttpException(output.message, output.status);
                }
            }));
        }
        catch (error) {
            throw new common_1.HttpException(error.message, error.status);
        }
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __param(2, (0, common_1.Inject)('LEAVE')),
    __param(3, (0, common_1.Inject)(common_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        microservices_1.ClientProxy, Object])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map