import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramTemplateEntity, UserEntity } from '../../entity';

@Module({
  imports: [TypeOrmModule.forFeature([TelegramTemplateEntity, UserEntity])],
  controllers: [],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
