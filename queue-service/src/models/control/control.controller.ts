import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { BullMQService } from '../bullmq/bullmq.service';
import { UtilService } from '../util/util.service';
import { ZodValidationPipe } from '../../zod/zod.pipe';
import { UpdateStatusQueueDto, updateStatusQueueSchema } from './control.zod';

@Controller('control')
export class ControlController {
  constructor(
    private readonly bullMQService: BullMQService,
    private readonly utilService: UtilService,
  ) {}

  // @Get('queue/jobs')
  // async queueGetListJobs(
  //   @Query('page') page: number = 0,
  //   @Query('limit') limit: number = 20,
  // ) {
  //   const start = (page - 1) * limit;
  //   const end = start + limit - 1;
  //
  //   return this.utilService.convertToPagination(
  //     await this.bullMQService.getListJobs(start, end),
  //     page,
  //     limit,
  //   );
  // }
  //
  // @Get('queue/job/:id')
  // async queueGetDetailJob(@Param('id') id: string) {
  //   if (!id || id.trim() === '') {
  //     throw new BadRequestException('Job ID is required');
  //   }
  //   return await this.bullMQService.getDetailJob(id);
  // }
  //
  // @Delete('queue/job/:id')
  // async queueDeleteJob(@Param('id') id: string) {
  //   if (!id || id.trim() === '') {
  //     throw new BadRequestException('Job ID is required');
  //   }
  //   await this.bullMQService.deleteJobById(id);
  //
  //   return {
  //     status: 'success',
  //     message: `Job with ID ${id} has been deleted successfully`,
  //   };
  // }
  //
  // @Delete('queue/jobs')
  // async queueDeleteAllJobs() {
  //   await this.bullMQService.deleteAllJobs();
  //
  //   return {
  //     status: 'success',
  //     message: 'All jobs in the queue have been deleted successfully',
  //   };
  // }
  //
  // @Get('queue/status')
  // async getStatusQueue() {
  //   return await this.bullMQService.getQueueStatus();
  // }
  //
  // @Put('queue/status')
  // async updateQueueStatus(
  //   @Body(new ZodValidationPipe(updateStatusQueueSchema))
  //   updateStatusQueueDto: UpdateStatusQueueDto,
  // ) {
  //   await this.bullMQService.pause(updateStatusQueueDto.pause);
  //
  //   return {
  //     status: 'success',
  //     message: 'Queue have been paused successfully',
  //   };
  // }
  //
  // @Put('queue/add/status')
  // updateQueueAddStatus(
  //   @Body(new ZodValidationPipe(updateStatusQueueSchema))
  //   updateStatusQueueDto: UpdateStatusQueueDto,
  // ) {
  //   this.bullMQService.pauseAdd(updateStatusQueueDto.pause);
  //
  //   return {
  //     status: 'success',
  //     message: 'Queue add have been paused successfully',
  //   };
  // }
  //
  // @Get('dashboard/status')
  // async getDashboardStatus() {
  //   return await this.bullMQService.getCountJobs();
  // }
}
