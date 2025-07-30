// Author: AdonisGM - Nguyen Manh Tung
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QueueData } from './bullmq.type';
import { ExportService } from '../export/export.service';

@Processor('queue_excel_simple', {
  concurrency: 1,
})
export class BullMQConsumer extends WorkerHost {
  queueName = 'queue_excel_simple';

  constructor(private readonly exportService: ExportService) {
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
