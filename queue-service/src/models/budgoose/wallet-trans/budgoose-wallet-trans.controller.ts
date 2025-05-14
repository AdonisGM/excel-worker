import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BudgooseWalletTransService } from './budgoose-wallet-trans.service';
import { AuthGuard } from '../../../guards/auth.guard';
import { BudgooseRegGuard } from '../../../guards/budgoose-reg.guard';
import { AuthDecorator } from '../../../decorator/auth.decorator';
import { BodyJWT } from '../../auth/auth.type';
import { PagingType } from '../../util/util.service';

@Controller('budgoose/wallet-trans')
@UseGuards(AuthGuard, BudgooseRegGuard)
export class BudgooseWalletTransController {
  constructor(
    private readonly budgooseWalletTransService: BudgooseWalletTransService,
  ) {}

  @Get('list')
  public async getList(
    @AuthDecorator() jwtData: BodyJWT,
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    // Get username from JWT
    const username = jwtData.username;

    // Get the Budgoose wallet transactions
    const list = await this.budgooseWalletTransService.getList(
      username,
      page,
      size,
    );

    // Return the Budgoose wallet transactions
    return list.map((e) => {
      return {
        budgooseWalletTransId: e.budgooseWalletTransId,
        budgooseWalletId: e.budgooseWallet.budgooseWalletId,
        budgooseWalletName: e.budgooseWallet.name,
        cashIn: e.cashIn,
        cashOut: e.cashOut,
        note: e.note,
        date: e.date,
        page: e.page,
      };
    });
  }

  @Get('list/:walletId')
  public async getListByWalletId(
    @AuthDecorator() jwtData: BodyJWT,
    @Query('page') page: number,
    @Query('size') size: number,
    @Param('walletId') walletId: string,
  ) {
    // Get username from JWT
    const username = jwtData.username;

    // Validate the wallet ID
    if (!walletId) {
      throw new BadRequestException('Wallet ID is required');
    }

    // Get the Budgoose wallet transactions
    const list = await this.budgooseWalletTransService.getListByWalletId(
      walletId,
      username,
      page,
      size,
    );

    // Return the Budgoose wallet transactions
    return list.map((e) => {
      return {
        budgooseWalletTransId: e.budgooseWalletTransId,
        budgooseWalletId: e.budgooseWallet.budgooseWalletId,
        budgooseWalletName: e.budgooseWallet.name,
        cashIn: e.cashIn,
        cashOut: e.cashOut,
        note: e.note,
        date: e.date,
        page: e.page,
      };
    });
  }
}
