import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { BullMQService } from './bullmq.service';
import { UtilService } from '../util/util.service';
import { ZodValidationPipe } from '../../zod/zod.pipe';
import { ExcelDto, excelSchema } from '../excel/excel.zod';
import { LoggerService } from '../logger/logger.service';
import {
  PauseAddDto,
  pauseAddSchema,
  PauseDto,
  pauseSchema,
} from './bullmq.zod';

@Controller('queue')
export class BullMQController {
  constructor(
    private readonly bullMQService: BullMQService,
    private readonly utilService: UtilService,
    private readonly loggerService: LoggerService,
  ) {}

  @Get('')
  async getQueues(
    @Query('queueName') queueName: string,
    @Query('jobId') jobId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.bullMQService.getAllQueue();
  }

  @Get(':queueName')
  async getDetailQueue(@Param('queueName') queueName: string) {
    return await this.bullMQService.getDetailQueue(queueName);
  }

  @Get(':queueName/job')
  async queueGetListJobs(
    @Param('queueName') queueName: string,
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 20,
  ) {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    return this.utilService.convertToPagination(
      await this.bullMQService.getListJobs(queueName, start, end),
      page,
      limit,
    );
  }

  @Post(':queueName/job')
  async addJob(
    @Param('queueName') queueName: string,
    @Body(new ZodValidationPipe(excelSchema)) excelDto: ExcelDto,
  ) {
    const { referId, code, data } = excelDto;

    const id = this.utilService.generateUUIDv7();

    try {
      await this.bullMQService.addQueue(queueName, id, referId, code, data);
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

  /**
   * Update pause-add state of a queue
   */
  @Patch(':queueName/pause-add')
  updatePauseAdd(
    @Param('queueName') queueName: string,
    @Body(new ZodValidationPipe(pauseAddSchema)) body: PauseAddDto,
  ) {
    this.bullMQService.setPauseAdd(queueName, body.isPaused);
    return {
      status: 'success',
      message: `Queue "${queueName}" add-pause state has been set to ${body.isPaused}`,
    };
  }

  /**
   * Pause or resume queue processing (jobs will not be processed while paused)
   */
  @Patch(':queueName/pause')
  async updateQueuePause(
    @Param('queueName') queueName: string,
    @Body(new ZodValidationPipe(pauseSchema)) body: PauseDto,
  ) {
    await this.bullMQService.setQueuePause(queueName, body.isPaused);
    return {
      status: 'success',
      message: `Queue "${queueName}" processing has been ${body.isPaused ? 'paused' : 'resumed'}`,
    };
  }

  /**
   * Remove all jobs from the queue (waiting, active, completed, failed, delayed, etc.)
   */
  @Delete(':queueName/job')
  async clearQueue(@Param('queueName') queueName: string) {
    await this.bullMQService.clearQueue(queueName);
    return {
      status: 'success',
      message: `All jobs from queue "${queueName}" have been removed.`,
    };
  }

  /**
   * Delete a job by its ID from the queue
   */
  @Delete(':queueName/job/:jobId')
  async deleteJobFromQueue(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    await this.bullMQService.deleteJobById(queueName, jobId);
    return {
      status: 'success',
      message: `Job "${jobId}" has been removed from queue "${queueName}".`,
    };
  }
}
