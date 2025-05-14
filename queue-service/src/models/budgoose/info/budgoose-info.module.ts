import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgooseInfoEntity, UserEntity } from '../../../entity';
import { BudgooseInfoController } from './budgoose-info.controller';
import { BudgooseInfoService } from './budgoose-info.service';

@Module({
  imports: [TypeOrmModule.forFeature([BudgooseInfoEntity, UserEntity])],
  controllers: [BudgooseInfoController],
  providers: [BudgooseInfoService],
  exports: [BudgooseInfoService],
})
export class BudgooseInfoModule {}
