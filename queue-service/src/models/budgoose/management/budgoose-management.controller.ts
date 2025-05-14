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
import { AuthGuard } from '../../../guards/auth.guard';
import { BudgooseRegGuard } from '../../../guards/budgoose-reg.guard';
import { BudgooseManagementService } from './budgoose-management.service';
import { AuthDecorator } from '../../../decorator/auth.decorator';
import { BodyJWT } from '../../auth/auth.type';
import { ZodValidationPipe } from '../../../zod/zod.pipe';
import {
  CreateBudgooseManagementDto,
  createBudgooseManagementSchema,
} from './budgoose-management.zod';

@Controller('budgoose/management')
@UseGuards(AuthGuard, BudgooseRegGuard)
export class BudgooseManagementController {
  constructor(
    private readonly budgooseManagementService: BudgooseManagementService,
  ) {}

  @Get('list')
  public async getList(
    @AuthDecorator() jwtData: BodyJWT,
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    // Get username from body
    const username = jwtData.username;

    const listManagement = await this.budgooseManagementService.getList(
      username,
      page,
      size,
    );

    return listManagement.map((e) => {
      return {
        page: e.page,
        budgooseManagementId: e.budgooseManagementId,
        businessType: e.businessType,
        date: e.date,
        cash: e.cash,
        budgooseWallet: e.budgooseWallet,
        budgooseWalletTarget: e.budgooseWalletTarget,
      };
    });
  }

  @Get(':managementId')
  public async getManagementById(
    @AuthDecorator() jwtData: BodyJWT,
    @Param('managementId') managementId: string,
  ) {
    const username = jwtData.username;

    // check if managementId is valid
    if (!managementId) {
      throw new BadRequestException('Invalid managementId');
    }

    // Get management by id
    const management = await this.budgooseManagementService.getManagementById(
      username,
      managementId,
    );

    return {
      businessType: management.businessType,
      date: management.date,
      cash: management.cash,
      description: management.description,
      budgooseWallet: management.budgooseWallet,
      budgooseWalletTarget: management.budgooseWalletTarget,
    };
  }

  @Post('create')
  public async createManagement(
    @AuthDecorator() jwtData: BodyJWT,
    @Body(new ZodValidationPipe(createBudgooseManagementSchema))
    body: CreateBudgooseManagementDto,
  ) {
    const username = jwtData.username;

    // Create management
    const management = await this.budgooseManagementService.createNewManagement(
      username,
      body,
    );

    return {
      budgooseManagementId: management.budgooseManagementId,
      businessType: management.businessType,
      date: management.date,
      cash: management.cash,
      description: management.description,
    };
  }

  @Put(':managementId')
  public async updateManagement(
    @AuthDecorator() jwtData: BodyJWT,
    @Param('managementId') managementId: string,
    @Body(new ZodValidationPipe(createBudgooseManagementSchema))
    body: CreateBudgooseManagementDto,
  ) {
    const username = jwtData.username;

    // check if managementId is valid
    if (!managementId) {
      throw new BadRequestException('Management ID is required');
    }

    // Update management
    const newManagement = await this.budgooseManagementService.updateManagement(
      username,
      managementId,
      body,
    );

    return {
      businessType: newManagement.businessType,
      date: newManagement.date,
      cash: newManagement.cash,
      description: newManagement.description,
    };
  }

  @Delete(':managementId')
  public async deleteManagement(
    @AuthDecorator() jwtData: BodyJWT,
    @Param('managementId') managementId: string,
  ) {
    const username = jwtData.username;

    // check if managementId is valid
    if (!managementId) {
      throw new BadRequestException('Management ID is required');
    }

    // Delete management
    await this.budgooseManagementService.deleteManagement(
      username,
      managementId,
    );

    return {
      message: 'Management deleted successfully',
    };
  }
}
