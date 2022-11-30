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
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const leave_schema_1 = require("./leave.schema");
const userProjection = {
    __v: false,
    _id: false,
    approveLink: false,
    rejectLink: false,
};
let LeaveService = class LeaveService {
    constructor(leaveModel, cacheManager) {
        this.leaveModel = leaveModel;
        this.cacheManager = cacheManager;
    }
    async applyLeave(data) {
        try {
            let formatError = {};
            const newDate = new Date(data.leaveDate);
            const leaveExist = await this.leaveModel.findOne({
                email: data.email,
                leaveDate: newDate.toISOString(),
            });
            if (leaveExist && leaveExist.rejected === true) {
                formatError = {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: `For this date  ${data.leaveDate} , Leave is rejected `,
                    result: [],
                    error: 'BAD_REQUEST',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
            }
            if (leaveExist) {
                formatError = {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: `Leave already exists for date ${data.leaveDate}`,
                    result: [],
                    error: 'BAD_REQUEST',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
            }
            const newLeave = new this.leaveModel({
                email: data.email,
                leaveDate: newDate.toISOString(),
                userId: data.userId,
            });
            await newLeave.save();
            return {
                statusCode: common_1.HttpStatus.CREATED,
                message: `sucessfully leave apllied for date ${data.leaveDate}`,
                result: [],
                error: 'No Error',
            };
        }
        catch (error) {
            return {
                statusCode: error.response.statusCode,
                message: error.response.message,
                result: error.response.result,
                error: error.response.error,
            };
        }
    }
    async checkEmployeeLeave(limitOfDocs = 0, toSkip = 0) {
        await this.cacheManager.set('cached_item', Math.random());
        const cachedItem = await this.cacheManager.get('cached_item');
        console.log(cachedItem);
        return await this.leaveModel
            .find({}, userProjection)
            .skip(toSkip)
            .limit(limitOfDocs)
            .exec();
    }
    async viewOwnLeave(data, limitOfDocs = 0, toSkip = 0) {
        try {
            let formatError = {};
            await this.cacheManager.set('cached_item', { key: 3 });
            await this.cacheManager.get('cached_item');
            const existUser = await this.leaveModel
                .find({ email: data.email }, userProjection)
                .skip(toSkip)
                .limit(limitOfDocs)
                .exec();
            if (existUser.length < limitOfDocs) {
                formatError = {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'No leaves to show',
                    result: [],
                    error: 'BAD_REQUEST',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
            }
            if (existUser.length === 0) {
                formatError = {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: `User with the email ${data.email}, Not apllied any leaves`,
                    result: [],
                    error: 'BAD_REQUEST',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
            }
            return {
                message: `Details of user with status ${data.email}`,
                result: existUser,
                status: common_1.HttpStatus.OK,
                error: 'No Error',
            };
        }
        catch (error) {
            return {
                statusCode: error.response.statusCode,
                message: error.response.message,
                result: error.response.result,
                error: error.response.error,
            };
        }
    }
    async viewEmployeePendingLeaveByUserId(data, limitOfDocs = 3, toSkip = 0) {
        try {
            let formatError = {};
            await this.cacheManager.set('cached_item', Math.random());
            const cachedItem = await this.cacheManager.get('cached_item');
            console.log(cachedItem);
            let links = {};
            let documents = await this.leaveModel.find({ userId: data.userId }, userProjection);
            let existUser = await this.leaveModel
                .find({ userId: data.userId }, userProjection)
                .skip(toSkip)
                .limit(limitOfDocs)
                .exec();
            links = {
                Start_Page: `http://localhost:3000/users/view-leaves?userId=${data.userId}&limit=${limitOfDocs}&skip=0`,
            };
            if (documents.length - limitOfDocs > limitOfDocs) {
                links['End_Page'] = `http://localhost:3000/users/view-leaves?userId=${data.userId}&limit=${limitOfDocs}&skip=${documents.length - limitOfDocs}`;
            }
            else {
                links['End_Page'] = `http://localhost:3000/users/view-leaves?userId=${data.userId}&limit=${limitOfDocs}&skip=${limitOfDocs}`;
            }
            if (!data.userId) {
                documents = await this.leaveModel.find({}, userProjection);
                links = {
                    Start_Page: `http://localhost:3000/users/view-leaves?limit=${limitOfDocs}&skip=0`,
                };
                if (documents.length - limitOfDocs > limitOfDocs) {
                    links['End_Page'] = `http://localhost:3000/users/view-leaves?limit=${limitOfDocs}&skip=${documents.length - limitOfDocs}`;
                }
                else {
                    links['End_Page'] = `http://localhost:3000/users/view-leaves?limit=${limitOfDocs}&skip=${limitOfDocs}`;
                }
                existUser = await this.leaveModel
                    .find({}, userProjection)
                    .skip(toSkip)
                    .limit(limitOfDocs)
                    .exec();
            }
            if (!existUser) {
                formatError = {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Invalid User',
                    result: [],
                    error: 'Bad Request',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
            }
            else if (existUser.length === 0) {
                formatError = {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'no Pending leaves or invalid User Id ',
                    result: [],
                    error: 'Bad Request',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
            }
            if (data.userId) {
                if (toSkip - limitOfDocs >= 0)
                    links['Previous_Page'] = `http://localhost:3000/users/view-leaves?userId=${data.userId}&limit=${limitOfDocs}&skip=${toSkip - limitOfDocs}`;
                if (Number(toSkip) + Number(limitOfDocs) < documents.length)
                    links['Next_Page'] = `http://localhost:3000/users/view-leaves?userId=${data.userId}&limit=${limitOfDocs}&skip=${Number(toSkip) + Number(limitOfDocs)}`;
                return {
                    message: `Details of user with status ${data.userId}`,
                    result: {
                        totalDocument: documents.length,
                        noOfDocument: existUser.length,
                        existUser,
                    },
                    links: links,
                    statusCode: common_1.HttpStatus.OK,
                };
            }
            else {
                if (toSkip - limitOfDocs >= 0) {
                    links['Previous_Page'] = `http://localhost:3000/users/view-leaves?limit=${limitOfDocs}&skip=${toSkip - limitOfDocs}`;
                }
                if (Number(toSkip) + Number(limitOfDocs) < documents.length) {
                    links['Next_Page'] = `http://localhost:3000/users/view-leaves?limit=${limitOfDocs}&skip=${Number(toSkip) + Number(limitOfDocs)}`;
                }
                return {
                    message: `Details of users with status `,
                    result: {
                        totalDocument: documents.length,
                        noOfDocument: existUser.length,
                        existUser,
                    },
                    links: links,
                    statusCode: common_1.HttpStatus.OK,
                    error: 'No Error',
                };
            }
        }
        catch (error) {
            return {
                statusCode: error.response.statusCode,
                message: error.response.message,
                result: error.response.result,
                error: error.response.error,
            };
        }
    }
    async viewEmployeePendingLeave(data, limitOfDocs = 3, toSkip = 0) {
        try {
            let formatError = {};
            await this.cacheManager.set('cached_item', Math.random());
            const cachedItem = await this.cacheManager.get('cached_item');
            console.log(cachedItem);
            const statusEnum_key = Object.keys(leave_schema_1.statusEnum).find((key) => leave_schema_1.statusEnum[key] === data.status);
            let existUser, documents, links;
            if (!data.userId) {
                documents = await this.leaveModel.find({ status: statusEnum_key, rejected: { $exists: false } }, userProjection);
                existUser = await this.leaveModel
                    .find({
                    status: statusEnum_key,
                    rejected: { $exists: false },
                })
                    .skip(toSkip)
                    .limit(limitOfDocs)
                    .exec();
                links = {
                    Start_Page: `http://localhost:3000/users/view-leaves?status=${data.status}&limit=${limitOfDocs}&skip=0`,
                };
                if (documents.length - limitOfDocs > limitOfDocs) {
                    links['End_Page'] = `http://localhost:3000/users/view-leaves?status=${data.status}&limit=${limitOfDocs}&skip=${documents.length - limitOfDocs}`;
                }
                else {
                    links['End_Page'] = `http://localhost:3000/users/view-leaves?status=${data.status}&limit=${limitOfDocs}&skip=${limitOfDocs}`;
                }
            }
            else {
                documents = await this.leaveModel.find({
                    userId: data.userId,
                    status: statusEnum_key,
                    rejected: { $exists: false },
                }, userProjection);
                existUser = await this.leaveModel
                    .find({
                    userId: data.userId,
                    status: statusEnum_key,
                    rejected: { $exists: false },
                })
                    .skip(toSkip)
                    .limit(limitOfDocs)
                    .exec();
                links = {
                    Start_Page: `http://localhost:3000/users/view-leaves?status=${data.status}&userId=${data.userId}&limit=${limitOfDocs}&skip=0`,
                };
                if (documents.length - limitOfDocs > limitOfDocs) {
                    links['End_Page'] = `http://localhost:3000/users/view-leaves?status=${data.status}&userId=${data.userId}&limit=${limitOfDocs}&skip=${documents.length - limitOfDocs}`;
                }
                else {
                    links['End_Page'] = `http://localhost:3000/users/view-leaves?status=${data.status}&userId=${data.userId}&limit=${limitOfDocs}&skip=${limitOfDocs}`;
                }
            }
            if (!existUser) {
                formatError = {
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Invalid User',
                    result: [],
                    error: 'Bad Request',
                };
                throw new common_1.HttpException(formatError, common_1.HttpStatus.BAD_REQUEST);
            }
            if (data.status === 'Pending')
                for (let i = 0; i < existUser.length; i++) {
                    existUser[i].approveLink = `http://localhost:3000/users/approve-leaves?leaveDate=${existUser[i].leaveDate}&userId=${existUser[i].userId}`;
                    existUser[i].rejectLink = `http://localhost:3000/users/reject-leaves?leaveDate=${existUser[i].leaveDate}&userId=${existUser[i].userId}`;
                    existUser[i].save();
                }
            if (!data.userId) {
                if (toSkip - limitOfDocs >= 0)
                    links['Previous_Page'] = `http://localhost:3000/users/view-leaves?status=${data.status}&limit=${limitOfDocs}&skip=${toSkip - limitOfDocs}`;
                if (Number(toSkip) + Number(limitOfDocs) < documents.length)
                    links['Next_Page'] = `http://localhost:3000/users/view-leaves?status=${data.status}&limit=${limitOfDocs}&skip=${Number(toSkip) + Number(limitOfDocs)}`;
                return {
                    message: `Details of user with status ${data.status}`,
                    result: {
                        totalDocument: documents.length,
                        noOfDocument: existUser.length,
                        existUser,
                    },
                    links: links,
                    statusCode: common_1.HttpStatus.OK,
                    error: 'No Error',
                };
            }
            else {
                if (toSkip - limitOfDocs >= 0)
                    links['Previous_Page'] = `http://localhost:3000/users/view-leaves?status=${data.status}&userId=${data.userId}&limit=${limitOfDocs}&skip=${toSkip - limitOfDocs}`;
                if (Number(toSkip) + Number(limitOfDocs) < documents.length)
                    links['Next_Page'] = `http://localhost:3000/users/view-leaves?status=${data.status}&userId=${data.userId}&limit=${limitOfDocs}&skip=${Number(toSkip) + Number(limitOfDocs)}`;
                return {
                    message: `Details of user with User Id ${data.userId} and status ${data.status}`,
                    result: {
                        totalDocument: documents.length,
                        noOfDocument: existUser.length,
                        existUser,
                    },
                    links: links,
                    statusCode: common_1.HttpStatus.OK,
                    error: 'No Error',
                };
            }
        }
        catch (error) {
            return {
                statusCode: error.response.statusCode,
                message: error.response.message,
                result: error.response.result,
                error: error.response.error,
            };
        }
    }
    async approveEmployeeLeaves(data) {
        try {
            const newDate = new Date(data.date);
            const IsoDate = newDate.toISOString();
            const user = await this.leaveModel.findOneAndUpdate({
                userId: data.userId,
                leaveDate: IsoDate,
                status: false,
                approveLink: `http://localhost:3000/users/approve-leaves?leaveDate=${IsoDate}&userId=${data.userId}`,
            }, {
                $set: { status: true },
                $unset: {
                    approveLink: `http://localhost:3000/users/approve-leaves?leaveDate=${IsoDate}&userId=${data.userId}`,
                    rejectLink: `http://localhost:3000/users/reject-leaves?leaveDate=${IsoDate}&userId=${data.userId}`,
                },
            });
            if (user) {
                return {
                    message: `Leave approved successfully for date ${data.date}`,
                    status: common_1.HttpStatus.OK,
                };
            }
            else {
                throw new common_1.HttpException('Link expired', common_1.HttpStatus.GONE);
            }
        }
        catch (error) {
            return {
                status: error.status,
                message: error.message,
            };
        }
    }
    async rejectEmployeeLeaves(data) {
        try {
            const newDate = new Date(data.date);
            const IsoDate = newDate.toISOString();
            const user = await this.leaveModel.findOneAndUpdate({
                userId: data.userId,
                leaveDate: IsoDate,
                status: false,
                rejectLink: `http://localhost:3000/users/reject-leaves?leaveDate=${IsoDate}&userId=${data.userId}`,
            }, {
                $unset: {
                    approveLink: `http://localhost:3000/users/approve-leaves?leaveDate=${IsoDate}&userId=${data.userId}`,
                    rejectLink: `http://localhost:3000/users/reject-leaves?leaveDate=${IsoDate}&userId=${data.userId}`,
                },
            });
            if (user) {
                user.rejected = true;
                user.save();
                return {
                    message: `Leave rejected successfully for date ${data.date}`,
                    status: common_1.HttpStatus.OK,
                };
            }
            else {
                throw new common_1.HttpException('Link expired', common_1.HttpStatus.GONE);
            }
        }
        catch (error) {
            return {
                status: error.status,
                message: error.message,
            };
        }
    }
};
LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Leave')),
    __param(1, (0, common_1.Inject)(common_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [mongoose_2.Model, Object])
], LeaveService);
exports.LeaveService = LeaveService;
//# sourceMappingURL=leave.service.js.map