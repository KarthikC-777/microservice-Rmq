"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const user_controller_1 = require("./user.controller");
const mongoose_1 = require("@nestjs/mongoose");
const user_schema_1 = require("./user.schema");
const jwt_1 = require("@nestjs/jwt");
const roles_guard_1 = require("./roles.guard");
const microservices_1 = require("@nestjs/microservices");
const config_1 = require("../config");
const jwt_guard_1 = require("./guards/jwt-guard");
const jwt_strategy_1 = require("./guards/jwt-strategy");
let UserModule = class UserModule {
};
UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                {
                    name: 'User',
                    schema: user_schema_1.userSchema,
                },
            ]),
            jwt_1.JwtModule.register({
                secret: 'User-secret',
            }),
            microservices_1.ClientsModule.register([
                {
                    name: 'LEAVE',
                    transport: microservices_1.Transport.RMQ,
                    options: {
                        urls: [`amqp://${config_1.user_name}:${config_1.password}@${config_1.rmq_host}/${config_1.virtual_host}`],
                        queue: config_1.queue_name,
                        queueOptions: {
                            durable: false,
                        },
                    },
                },
            ]),
            common_1.CacheModule.register({
                isGlobal: true,
                ttl: 5,
                max: 100,
            }),
        ],
        providers: [
            user_service_1.UserService,
            jwt_guard_1.JwtAuthGuard,
            jwt_strategy_1.JwtStrategy,
            roles_guard_1.RolesGuard,
        ],
        controllers: [user_controller_1.UserController],
    })
], UserModule);
exports.UserModule = UserModule;
//# sourceMappingURL=user.module.js.map