"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rmq_host = exports.queue_name = exports.virtual_host = exports.password = exports.user_name = exports.leave_host = exports.user_host = exports.db_name = exports.db_host = void 0;
exports.db_host = process.env.DB_HOST || 'localhost:27017';
exports.db_name = process.env.DB_NAME || 'Appsmith-User';
exports.user_host = process.env.USER_HOST || 'user';
exports.leave_host = process.env.LEAVE_HOST || '127.0.0.1' || 'localhost';
exports.user_name = process.env.USER_NAME || 'guest';
exports.password = process.env.PASSWORD || 'guest';
exports.virtual_host = '/';
exports.queue_name = 'User-Queue';
exports.rmq_host = process.env.RMQ_HOST || '127.0.0.1:5672';
//# sourceMappingURL=config.js.map