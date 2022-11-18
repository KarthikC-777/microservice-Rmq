import { CacheModule, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { userSchema } from './user.schema';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  leave_host,
  password,
  queue_name,
  rmq_host,
  user_name,
  virtual_host,
} from 'src/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: userSchema,
      },
    ]),
    JwtModule.register({
      secret: 'User-secret',
    }),
    // ClientsModule.register([
    //   {
    //     name: 'LEAVE',
    //     transport: Transport.TCP,
    //     options: { host: leave_host, port: 3001 },
    //   },
    // ]),
    ClientsModule.register([
      {
        name: 'LEAVE',
        transport: Transport.RMQ,
        options: {
          urls: [`amqp://${user_name}:${password}@${rmq_host}/${virtual_host}`],
          queue: queue_name,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    CacheModule.register({
      isGlobal: true,
      ttl: 10,
      max: 100,
    }),
  ],
  providers: [
    UserService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  controllers: [UserController],
})
export class UserModule {}
