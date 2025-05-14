import { Module } from '@nestjs/common';
import { BudgooseWalletTransController } from './budgoose-wallet-trans.controller';
import { BudgooseWalletTransService } from './budgoose-wallet-trans.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BudgooseInfoEntity,
  BudgooseManagementEntity,
  BudgooseWalletEntity,
  BudgooseWalletTransEntity,
} from '../../../entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BudgooseWalletTransEntity,
      BudgooseInfoEntity,
      BudgooseWalletEntity,
      BudgooseManagementEntity,
    ]),
  ],
  controllers: [BudgooseWalletTransController],
  providers: [BudgooseWalletTransService],
  exports: [BudgooseWalletTransService],
})
export class BudgooseWalletTransModule {}
