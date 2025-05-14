import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { UserRefreshTokenModule } from '../user-refresh-token/user-refresh-token.module';
import { UserLoginLoggerModule } from '../user-login-logger/user-login-logger.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
    }),
    UserModule,
    UserRefreshTokenModule,
    UserLoginLoggerModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
