import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemsModule } from 'src/items/items.module';
import { UsersModule } from 'src/users/users.module';
import { LoggerMiddleware } from 'src/common/middlewares/logger';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ApiExceptionFilter } from 'src/common/filters/exception';
import { AuthAdminGuard } from 'src/common/guards/admin';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), ItemsModule, UsersModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthAdminGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
