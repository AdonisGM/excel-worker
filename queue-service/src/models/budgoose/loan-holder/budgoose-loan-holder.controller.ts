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
import { BudgooseLoanHolderService } from './budgoose-loan-holder.service';
import { AuthGuard } from '../../../guards/auth.guard';
import { AuthDecorator } from '../../../decorator/auth.decorator';
import { BodyJWT } from '../../auth/auth.type';
import { ZodValidationPipe } from '../../../zod/zod.pipe';
import {
  CreateBudgooseHolderDto,
  createBudgooseHolderSchema,
} from './budgoose-loan-holder.zod';
import { BudgooseRegGuard } from '../../../guards/budgoose-reg.guard';

@Controller('budgoose/loan-holder')
@UseGuards(AuthGuard, BudgooseRegGuard)
export class BudgooseLoanHolderController {
  constructor(
    private readonly budgooseHolderService: BudgooseLoanHolderService,
  ) {}

  @Get('list')
  public async getList(
    @AuthDecorator() jwtData: BodyJWT,
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    // Get username from body
    const username = jwtData.username;

    const listHolder = await this.budgooseHolderService.findByUsername(
      username,
      page,
      size,
    );

    // convert to pagination
    return listHolder.map((e) => {
      return {
        budgooseLoanHolderId: e.budgooseLoanHolderId,
        holderName: e.holderName,
        cashLoan: e.cashLoan,
        note: e.note,
        page: e.page,
      };
    });
  }

  @Post('create')
  public async create(
    @AuthDecorator() jwtData: BodyJWT,
    @Body(new ZodValidationPipe(createBudgooseHolderSchema))
    body: CreateBudgooseHolderDto,
  ) {
    // Get username from body
    const username = jwtData.username;

    const newHolder = await this.budgooseHolderService.createNewHolder(
      username,
      body,
    );

    return {
      budgooseLoanHolderId: newHolder.budgooseLoanHolderId,
      holderName: newHolder.holderName,
      cashLoan: newHolder.cashLoan,
      note: newHolder.note,
    };
  }

  @Get(':holderId')
  public async getDetail(
    @AuthDecorator() jwtData: BodyJWT,
    @Param('holderId') holderId: string,
  ) {
    // Get username from body
    const username = jwtData.username;

    if (!holderId) {
      throw new BadRequestException('Holder id is required');
    }

    const selectedHolder = await this.budgooseHolderService.getDetail(
      holderId,
      username,
    );

    return {
      budgooseLoanHolderId: selectedHolder.budgooseLoanHolderId,
      holderName: selectedHolder.holderName,
      cashLoan: selectedHolder.cashLoan,
      note: selectedHolder.note,
    };
  }

  @Put(':holderId')
  public async update(
    @AuthDecorator() jwtData: BodyJWT,
    @Body(new ZodValidationPipe(createBudgooseHolderSchema))
    body: CreateBudgooseHolderDto,
    @Param('holderId')
    holderId: string,
  ) {
    // Get username from body
    const username = jwtData.username;

    if (!holderId) {
      throw new BadRequestException('Holder id is required');
    }

    const updatedHolder = await this.budgooseHolderService.updateHolder(
      holderId,
      username,
      body,
    );

    return {
      budgooseLoanHolderId: updatedHolder.budgooseLoanHolderId,
      holderName: updatedHolder.holderName,
      cashLoan: updatedHolder.cashLoan,
      note: updatedHolder.note,
    };
  }

  @Delete(':holderId')
  public async delete(
    @AuthDecorator() jwtData: BodyJWT,
    @Param('holderId') holderId: string,
  ) {
    // Get username from body
    const username = jwtData.username;

    if (!holderId) {
      throw new BadRequestException('Holder id is required');
    }

    // Delete holder
    await this.budgooseHolderService.deleteHolder(holderId, username);

    return {};
  }
}
