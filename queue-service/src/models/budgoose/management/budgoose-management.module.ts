import { Module } from '@nestjs/common';
import { BudgooseManagementController } from './budgoose-management.controller';
import { BudgooseManagementService } from './budgoose-management.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BudgooseInfoEntity,
  BudgooseManagementEntity,
  BudgooseManagementLoanEntity,
  BudgooseWalletEntity,
  UserEntity,
} from '../../../entity';
import { BudgooseLoanTransModule } from '../loan-trans/budgoose-loan-trans.module';
import { BudgooseWalletTransModule } from '../wallet-trans/budgoose-wallet-trans.module';
import { TelegramModule } from '../../telegram/telegram.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BudgooseManagementEntity,
      BudgooseWalletEntity,
      BudgooseInfoEntity,
      BudgooseManagementLoanEntity,
      UserEntity,
    ]),
    BudgooseLoanTransModule,
    BudgooseWalletTransModule,
    TelegramModule,
  ],
  controllers: [BudgooseManagementController],
  providers: [BudgooseManagementService],
  exports: [BudgooseManagementService],
})
export class BudgooseManagementModule {}
