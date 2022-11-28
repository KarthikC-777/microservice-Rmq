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
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = exports.user = exports.UserDesignation = exports.UserRole = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var UserRole;
(function (UserRole) {
    UserRole["User"] = "user";
    UserRole["Admin"] = "admin";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
var UserDesignation;
(function (UserDesignation) {
    UserDesignation["ASE"] = "Associate Software Engineer";
    UserDesignation["SE"] = "Software Engineer";
    UserDesignation["SSE"] = "Senior Software Engineer";
    UserDesignation["EM"] = "Engineering Manager";
    UserDesignation["BD"] = "Backend Developer";
})(UserDesignation = exports.UserDesignation || (exports.UserDesignation = {}));
let user = class user {
};
__decorate([
    (0, mongoose_1.Prop)({}),
    __metadata("design:type", String)
], user.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], user.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], user.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], user.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({}),
    __metadata("design:type", Number)
], user.prototype, "phonenumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({}),
    __metadata("design:type", String)
], user.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)({}),
    __metadata("design:type", Number)
], user.prototype, "salary", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: UserRole.User }),
    __metadata("design:type", Array)
], user.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({}),
    __metadata("design:type", String)
], user.prototype, "designation", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], user.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 10 }),
    __metadata("design:type", Number)
], user.prototype, "availableLeaves", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, default: 0 }),
    __metadata("design:type", String)
], user.prototype, "resetToken", void 0);
user = __decorate([
    (0, mongoose_1.Schema)()
], user);
exports.user = user;
exports.userSchema = mongoose_1.SchemaFactory.createForClass(user);
//# sourceMappingURL=user.schema.js.map