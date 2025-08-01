import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ExcelService } from './excel.service';
import { ZodValidationPipe } from '../../zod/zod.pipe';
import { ExcelDto, excelSchema } from './excel.zod';
import { UtilService } from '../util/util.service';
import { LoggerService } from '../logger/logger.service';
import { BullMQService } from '../bullmq/bullmq.service';

@Controller('excel')
export class ExcelController {
  constructor(
    private readonly bullMQService: BullMQService,
    private readonly utilService: UtilService,
    private readonly loggerService: LoggerService,
  ) {}

  @Post('async')
  @HttpCode(HttpStatus.CREATED)
  async processExport(
    @Body(new ZodValidationPipe(excelSchema)) excelDto: ExcelDto,
  ) {
    const { referId, code, data } = excelDto;

    const id = this.utilService.generateUUIDv7();

    try {
      await this.bullMQService.addQueue(id, referId, code, data);
    } catch (error) {
      const typedError = error as Error;
      this.loggerService.error(typedError);

      throw new BadRequestException(
        `Failed to queue Excel generation job: ${typedError.message}`,
      );
    }

    this.loggerService.log(`Excel generation job queued with ID: ${id}`);

    return {
      status: 'success',
      message: 'Excel generation job has been queued successfully',
      data: {
        id,
        referId,
        code,
      },
    };
  }
}
