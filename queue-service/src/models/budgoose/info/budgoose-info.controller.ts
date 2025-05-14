import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BudgooseInfoService } from './budgoose-info.service';
import { AuthGuard } from '../../../guards/auth.guard';
import { AuthDecorator } from '../../../decorator/auth.decorator';
import { BodyJWT } from '../../auth/auth.type';
import { BudgooseRegGuard } from '../../../guards/budgoose-reg.guard';

@Controller('budgoose/info')
@UseGuards(AuthGuard)
export class BudgooseInfoController {
  constructor(private readonly budgooseInfoService: BudgooseInfoService) {}

  @Get('check-register')
  public async checkRegisterService(@AuthDecorator() jwtData: BodyJWT) {
    // Get username from jwtData
    const username = jwtData.username;

    const isRegistered =
      await this.budgooseInfoService.checkRegisteredService(username);

    if (isRegistered) {
      return {
        isRegister: true,
        message: 'User is registered',
      };
    } else {
      return {
        isRegister: false,
        message: 'User is not registered',
      };
    }
  }

  @Get('get')
  @UseGuards(BudgooseRegGuard)
  public async getBudgooseInfo(@AuthDecorator() jwtData: BodyJWT) {
    // Get username from jwtData
    const username = jwtData.username;

    const budgooseInfo =
      (await this.budgooseInfoService.getByUsername(username))!;

    return {
      cashBalance: budgooseInfo.cashBalance,
      cashCreditLimit: budgooseInfo.cashCreditLimit,
      cashCreditUsage: budgooseInfo.cashCreditUsage,
      cashLoan: budgooseInfo.cashLoan,
      cashSavings: budgooseInfo.cashSavings,
    };
  }

  @Post('register')
  public async registerBudgooseInfo(@AuthDecorator() jwtData: BodyJWT) {
    // Get username from jwtData
    const username = jwtData.username;

    // Register user to budgoose service
    const newBudgooseInfo =
      await this.budgooseInfoService.registerService(username);

    return {
      cashBalance: newBudgooseInfo.cashBalance,
      cashCreditLimit: newBudgooseInfo.cashCreditLimit,
      cashCreditUsage: newBudgooseInfo.cashCreditUsage,
      cashLoan: newBudgooseInfo.cashLoan,
      cashSavings: newBudgooseInfo.cashSavings,
    };
  }
}
