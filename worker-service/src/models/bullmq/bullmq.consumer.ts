// Author: AdonisGM - Nguyen Manh Tung
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QueueData } from './bullmq.type';
import { ExportService } from '../export/export.service';
import { FileService } from '../file/file.service';
import { LoggerService } from '../logger/logger.service';

@Processor('queue_excel_bo_01', {
  concurrency: 1,
})
export class BullMQConsumer extends WorkerHost {
  queueName = 'queue_excel_bo_01';

  constructor(
    private readonly exportService: ExportService,
    private readonly fileService: FileService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job<QueueData, any, string>) {
    const idQueueItem = job.id;
    const dataQueue = job.data;

    let location: string | void;
    try {
      location = await this.exportService.processExport(
        dataQueue.referId,
        dataQueue.fileCode,
        dataQueue.data,
      );

      if (!location) {
        throw new Error(`Failed to process export for job ${idQueueItem}`);
      }
    } catch (error) {
      console.error(`Error processing job ${idQueueItem}:`, error);
      throw error; // Re-throw the error to ensure the job fails
    }

    // Upload file to main storage
    this.fileService
      .uploadToMain(dataQueue.id, dataQueue.referId, location)
      .then()
      .catch((err) => {
        this.logger.error(
          `Failed to upload file for job ${idQueueItem} - location: ${location}`,
        );
        console.log(err);
      });

    return {
      status: 'success',
      message: `Job ${idQueueItem} processed successfully`,
      data: {
        idQueueItem,
        location,
      },
    };
  }
}
