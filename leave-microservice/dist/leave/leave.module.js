"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveModule = void 0;
const common_1 = require("@nestjs/common");
const leave_service_1 = require("./leave.service");
const leave_controller_1 = require("./leave.controller");
const leave_schema_1 = require("./leave.schema");
const mongoose_1 = require("@nestjs/mongoose");
let LeaveModule = class LeaveModule {
};
LeaveModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                {
                    name: 'Leave',
                    schema: leave_schema_1.leaveschema,
                },
            ]),
            common_1.CacheModule.register({
                isGlobal: true,
                ttl: 40000,
                max: 300,
            }),
        ],
        providers: [leave_service_1.LeaveService],
        controllers: [leave_controller_1.LeaveController],
    })
], LeaveModule);
exports.LeaveModule = LeaveModule;
//# sourceMappingURL=leave.module.js.map