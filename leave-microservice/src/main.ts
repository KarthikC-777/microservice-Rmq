import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  password,
  user_name,
  virtual_host,
  queue_name,
  rmq_host,
} from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    // transport: Transport.TCP,
    // options: {
    //   host: leave_host,
    //   port: 3001,
    // },
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://${user_name}:${password}@${rmq_host}/${virtual_host}`],
      queue: queue_name,
      noAck: false,
      queueOptions: {
        durable: false,
      },
      prefetchCount: 1,
    },
  });
  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .setTitle('Y Media Labs')
    .setDescription('GreytHr')
    .setVersion('2.0')
    .addTag('Users')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('users', app, document);
  await app.listen(3002);
}
bootstrap();
