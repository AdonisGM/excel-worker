import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRefreshTokenEntity } from '../../entity';
import { UserRefreshTokenService } from './user-refresh-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserRefreshTokenEntity])],
  controllers: [],
  providers: [UserRefreshTokenService],
  exports: [UserRefreshTokenService],
})
export class UserRefreshTokenModule {}
