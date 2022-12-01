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
exports.UserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const user_schema_1 = require("../user.schema");
class UserDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'image url of the user',
        example: '',
    }),
    __metadata("design:type", String)
], UserDto.prototype, "image", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the user',
        example: 'John',
    }),
    __metadata("design:type", String)
], UserDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address of the user',
        example: 'john@email.com',
    }),
    (0, class_validator_1.IsEmail)({
        message: 'Enter a valid email address, Example: <name>@gmail/email.com',
    }),
    __metadata("design:type", String)
], UserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Password of the user',
        example: 'Qzw@170.xz',
    }),
    (0, class_validator_1.MinLength)(8, {
        message: 'Password must have a minimum of 8 characters ',
    }),
    __metadata("design:type", String)
], UserDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Phone Number of the user',
        example: '9000477890',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(10, 10, {
        message: 'Phone Number must be of length 10',
    }),
    __metadata("design:type", Number)
], UserDto.prototype, "phonenumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Salary of the user',
        example: '100000',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UserDto.prototype, "salary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(user_schema_1.UserRole),
    __metadata("design:type", Array)
], UserDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Designation of the user',
        example: 'ASE',
    }),
    __metadata("design:type", String)
], UserDto.prototype, "designation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Equals)('active', {
        message: 'Account status cannot be changed',
    }),
    __metadata("design:type", Boolean)
], UserDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Address of the user',
        example: 'California, US',
    }),
    (0, class_validator_1.Length)(2, 30, {
        message: 'Provide proper address, Example: Banglore,Mumbai,Chennai.. ,..,',
    }),
    __metadata("design:type", String)
], UserDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Equals)('', {
        message: 'availableLeaves is not accessible',
    }),
    __metadata("design:type", Number)
], UserDto.prototype, "availableLeaves", void 0);
exports.UserDto = UserDto;
//# sourceMappingURL=user.dto.js.map