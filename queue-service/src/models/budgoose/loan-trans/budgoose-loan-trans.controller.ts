import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../../guards/auth.guard';
import { BudgooseRegGuard } from '../../../guards/budgoose-reg.guard';
import { AuthDecorator } from '../../../decorator/auth.decorator';
import { BodyJWT } from '../../auth/auth.type';
import { BudgooseLoanTransService } from './budgoose-loan-trans.service';

@Controller('budgoose/loan-trans')
@UseGuards(AuthGuard, BudgooseRegGuard)
export class BudgooseLoanTransController {
  constructor(
    private readonly budgooseLoanTransService: BudgooseLoanTransService,
  ) {}

  @Get('list')
  public async getList(
    @AuthDecorator() jwtData: BodyJWT,
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    // Get username from JWT
    const username = jwtData.username;

    // Get the Budgoose loan transactions
    const list = await this.budgooseLoanTransService.getList(
      username,
      page,
      size,
    );

    // Return the Budgoose loan transactions
    return list.map((e) => {
      return {
        budgooseLoanTransId: e.budgooseLoanTransId,
        budgooseLoanHolderId: e.budgooseLoanHolderEntity.budgooseLoanHolderId,
        budgooseLoanHolderName: e.budgooseLoanHolderEntity.holderName,
        cashIn: e.cashIn,
        cashOut: e.cashOut,
        note: e.note,
        date: e.date,
        page: e.page,
      };
    });
  }

  @Get('list/:loanHolderId')
  public async getListByLoanHolder(
    @AuthDecorator() jwtData: BodyJWT,
    @Query('page') page: number,
    @Query('size') size: number,
    @Param('loanHolderId') loanHolderId: string,
  ) {
    // Get username from JWT
    const username = jwtData.username;

    // Validate the loanHolderId
    if (!loanHolderId) {
      throw new BadRequestException('Loan Holder ID is required');
    }

    // Get the Budgoose loan transactions
    const list = await this.budgooseLoanTransService.getListByLoanHolder(
      loanHolderId,
      username,
      page,
      size,
    );

    // Return the Budgoose loan transactions
    return list.map((e) => {
      return {
        budgooseLoanTransId: e.budgooseLoanTransId,
        budgooseLoanHolderId: e.budgooseLoanHolderEntity.budgooseLoanHolderId,
        budgooseLoanHolderName: e.budgooseLoanHolderEntity.holderName,
        cashIn: e.cashIn,
        cashOut: e.cashOut,
        note: e.note,
        date: e.date,
        page: e.page,
      };
    });
  }
}
