export const db_host = process.env.DB_HOST || 'localhost:27017';
export const db_name = process.env.DB_NAME || 'Leave';
export const user_host = process.env.USER_HOST || 'user';
export const leave_host = process.env.LEAVE_HOST || '127.0.0.1' || 'localhost';
export const user_name = process.env.USER_NAME || 'guest';
export const password = process.env.PASSWORD || 'guest';
export const virtual_host = '/';
export const queue_name = 'User-Queue';
export const rmq_host = process.env.RMQ_HOST || 'localhost:5672';
