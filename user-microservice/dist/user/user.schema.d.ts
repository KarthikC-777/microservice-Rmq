/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { Document } from 'mongoose';
export declare type userDocument = user & Document;
export declare enum UserRole {
    User = "user",
    Admin = "admin"
}
export declare enum UserDesignation {
    ASE = "Associate Software Engineer",
    SE = "Software Engineer",
    SSE = "Senior Software Engineer",
    EM = "Engineering Manager",
    BD = "Backend Developer"
}
export declare class user {
    userId: string;
    name: string;
    email: string;
    password: string;
    phonenumber: number;
    address: string;
    salary: number;
    role: string[];
    designation: string;
    status: boolean;
    availableLeaves: number;
    resetToken: string;
}
export declare const userSchema: import("mongoose").Schema<user, import("mongoose").Model<user, any, any, any, any>, {}, {}, {}, {}, "type", user>;
