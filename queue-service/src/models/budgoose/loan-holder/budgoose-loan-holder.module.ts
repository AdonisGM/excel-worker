import { Module } from '@nestjs/common';
import { BudgooseLoanHolderController } from './budgoose-loan-holder.controller';
import { BudgooseLoanHolderService } from './budgoose-loan-holder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BudgooseInfoEntity,
  BudgooseLoanHolderEntity,
  BudgooseLoanTransEntity,
  UserEntity,
} from '../../../entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BudgooseLoanHolderEntity,
      BudgooseLoanTransEntity,
      BudgooseInfoEntity,
      UserEntity,
    ]),
  ],
  controllers: [BudgooseLoanHolderController],
  providers: [BudgooseLoanHolderService],
  exports: [BudgooseLoanHolderService],
})
export class BudgooseLoanHolderModule {}
