"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const config_1 = require("./config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.connectMicroservice({
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [`amqp://${config_1.user_name}:${config_1.password}@${config_1.rmq_host}/${config_1.virtual_host}`],
            queue: config_1.queue_name,
            noAck: false,
            queueOptions: {
                durable: false,
            },
            prefetchCount: 1,
        },
    });
    await app.startAllMicroservices();
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Y Media Labs')
        .setDescription('GreytHr')
        .setVersion('2.0')
        .addTag('Users')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('users', app, document);
    await app.listen(3001);
}
bootstrap();
//# sourceMappingURL=main.js.map