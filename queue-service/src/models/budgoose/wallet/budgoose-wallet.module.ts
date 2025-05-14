import { Module } from '@nestjs/common';
import { BudgooseWalletController } from './budgoose-wallet.controller';
import { BudgooseWalletService } from './budgoose-wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BudgooseInfoEntity,
  BudgooseWalletEntity,
  UserEntity,
} from '../../../entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BudgooseWalletEntity,
      BudgooseInfoEntity,
      UserEntity,
    ]),
  ],
  controllers: [BudgooseWalletController],
  providers: [BudgooseWalletService],
  exports: [BudgooseWalletService],
})
export class BudgooseWalletModule {}
