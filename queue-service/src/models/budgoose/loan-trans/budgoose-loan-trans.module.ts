import { Module } from '@nestjs/common';
import { BudgooseLoanTransService } from './budgoose-loan-trans.service';
import { BudgooseLoanTransController } from './budgoose-loan-trans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BudgooseInfoEntity,
  BudgooseLoanHolderEntity,
  BudgooseLoanTransEntity,
  BudgooseManagementEntity,
} from '../../../entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BudgooseLoanTransEntity,
      BudgooseInfoEntity,
      BudgooseLoanHolderEntity,
      BudgooseManagementEntity,
    ]),
  ],
  controllers: [BudgooseLoanTransController],
  providers: [BudgooseLoanTransService],
  exports: [BudgooseLoanTransService],
})
export class BudgooseLoanTransModule {}
