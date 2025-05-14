import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BudgooseWalletService } from './budgoose-wallet.service';
import { AuthGuard } from '../../../guards/auth.guard';
import { AuthDecorator } from '../../../decorator/auth.decorator';
import { BodyJWT } from '../../auth/auth.type';
import { ZodValidationPipe } from '../../../zod/zod.pipe';
import {
  CreateBudgooseWalletDto,
  createBudgooseWalletSchema,
} from './budgoose-wallet.zod';
import { BudgooseRegGuard } from '../../../guards/budgoose-reg.guard';

@Controller('budgoose/wallet')
@UseGuards(AuthGuard, BudgooseRegGuard)
export class BudgooseWalletController {
  constructor(private readonly budgooseWalletService: BudgooseWalletService) {}

  @Get('list')
  public async getBudgooseWallet(
    @AuthDecorator() jwtData: BodyJWT,
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    // Get username from JWT
    const username = jwtData.username;

    // Get the Budgoose wallet
    const list = await this.budgooseWalletService.getWallets(
      username,
      page,
      size,
    );

    // Return the Budgoose wallet
    return list.map((e) => {
      return {
        budgooseWalletId: e.budgooseWalletId,
        name: e.name,
        description: e.description,
        cashBalance: e.cashBalance,
      };
    });
  }

  @Get(':walletId')
  public async getDetail(
    @AuthDecorator() jwtData: BodyJWT,
    @Param('walletId') walletId: string,
  ) {
    // Get username from JWT
    const username = jwtData.username;

    // Check walletId
    if (!walletId) {
      throw new BadRequestException('Wallet ID is required');
    }

    // Get the Budgoose wallet
    const wallet = await this.budgooseWalletService.getWalletById(
      username,
      walletId,
    );

    // Return the Budgoose wallet
    return {
      budgooseWalletId: wallet.budgooseWalletId,
      name: wallet.name,
      description: wallet.description,
      cashBalance: wallet.cashBalance,
    };
  }

  @Post('create')
  public async createBudgooseWallet(
    @AuthDecorator() jwtData: BodyJWT,
    @Body(new ZodValidationPipe(createBudgooseWalletSchema))
    body: CreateBudgooseWalletDto,
  ) {
    // Get username from JWT
    const username = jwtData.username;

    // Create new Budgoose wallet
    const wallet = await this.budgooseWalletService.createNewWallet(
      username,
      body,
    );

    // Return the Budgoose wallet
    return {
      budgooseWalletId: wallet.budgooseWalletId,
      name: wallet.name,
      description: wallet.description,
      cashBalance: wallet.cashBalance,
    };
  }

  @Put(':walletId')
  public async updateBudgooseWallet(
    @AuthDecorator() jwtData: BodyJWT,
    @Param('walletId') walletId: string,
    @Body(new ZodValidationPipe(createBudgooseWalletSchema))
    body: CreateBudgooseWalletDto,
  ) {
    // Get username from JWT
    const username = jwtData.username;

    // Check walletId
    if (!walletId) {
      throw new BadRequestException('Wallet ID is required');
    }

    // Update the Budgoose wallet
    const wallet = await this.budgooseWalletService.updateWallet(
      username,
      walletId,
      body,
    );

    // Return the Budgoose wallet
    return {
      budgooseWalletId: wallet.budgooseWalletId,
      name: wallet.name,
      description: wallet.description,
      cashBalance: wallet.cashBalance,
    };
  }

  @Delete(':walletId')
  public async deleteBudgooseWallet(
    @AuthDecorator() jwtData: BodyJWT,
    @Param('walletId') walletId: string,
  ) {
    // Get username from JWT
    const username = jwtData.username;

    // Check walletId
    if (!walletId) {
      throw new BadRequestException('Wallet ID is required');
    }

    // Delete the Budgoose wallet
    await this.budgooseWalletService.deleteWallet(username, walletId);

    // Return success message
    return {};
  }
}
