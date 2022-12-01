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
exports.EmployeeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class EmployeeDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the user',
        example: 'Dave',
    }),
    __metadata("design:type", String)
], EmployeeDto.prototype, "name", void 0);
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
], EmployeeDto.prototype, "phonenumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Address of the user',
        example: 'California, US',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(2, 30, {
        message: 'Provide proper address, Example: Banglore,Mumbai,Chennai.. ,..,',
    }),
    __metadata("design:type", String)
], EmployeeDto.prototype, "address", void 0);
exports.EmployeeDto = EmployeeDto;
//# sourceMappingURL=employee.dto.js.map