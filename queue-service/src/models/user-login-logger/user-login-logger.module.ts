import { Module } from '@nestjs/common';
import { UserLoginLoggerService } from './user-login-logger.sevice';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLoginLoggerEntity } from '../../entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserLoginLoggerEntity])],
  controllers: [],
  providers: [UserLoginLoggerService],
  exports: [UserLoginLoggerService],
})
export class UserLoginLoggerModule {}
