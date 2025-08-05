import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { DataValue, QueueData } from '../excel/excel.type';

@Injectable()
export class BullMQService {
  private isPauseAdd: {
    name: string;
    isPaused: boolean;
  }[];

  constructor(
    @InjectQueue('queue_excel_bo_01')
    private queueExcelBo01: Queue<QueueData>,
    @InjectQueue('queue_excel_bo_02')
    private queueExcelBo02: Queue<QueueData>,
    @InjectQueue('queue_word_bo_01')
    private queueWordBo01: Queue<QueueData>,
    @InjectQueue('queue_word_bo_02')
    private queueWordBo02: Queue<QueueData>,
    @InjectQueue('queue_excel_fo_01')
    private queueExcelFo01: Queue<QueueData>,
    @InjectQueue('queue_word_fo_01')
    private queueWordFo01: Queue<QueueData>,
    @InjectQueue('queue_excel_vsms_01')
    private queueExcelVsms01: Queue<QueueData>,
    @InjectQueue('queue_word_vsms_01')
    private queueWordVsms01: Queue<QueueData>,
  ) {}

  /**
   * Get queue by name
   * @param {string} queueName - The name of the queue to retrieve
   * @returns {Queue<QueueData>} - The queue instance
   * @throws {BadRequestException} - If the queue name is invalid or not found
   */
  private getQueueName(queueName: string): Queue<QueueData> {
    switch (queueName) {
      case 'queue_excel_bo_01':
        return this.queueExcelBo01;
      case 'queue_excel_bo_02':
        return this.queueExcelBo02;
      case 'queue_word_bo_01':
        return this.queueWordBo01;
      case 'queue_word_bo_02':
        return this.queueWordBo02;
      case 'queue_excel_fo_01':
        return this.queueExcelFo01;
      case 'queue_word_fo_01':
        return this.queueWordFo01;
      case 'queue_excel_vsms_01':
        return this.queueExcelVsms01;
      case 'queue_word_vsms_01':
        return this.queueWordVsms01;
      default:
        throw new BadRequestException(`Queue ${queueName} not found`);
    }
  }

  /**
   * Get all queue and basic information
   * @return {Promise<Array<{ name: string; isPaused: boolean }>>} - An array of objects containing queue names and their paused status
   * @throws {BadRequestException} - If an error occurs while retrieving queue information
   */
  public async getAllQueue() {
    const queues = [
      this.queueExcelBo01,
      this.queueExcelBo02,
      this.queueWordBo01,
      this.queueWordBo02,
      this.queueExcelFo01,
      this.queueWordFo01,
      this.queueExcelVsms01,
      this.queueWordVsms01,
    ];

    try {
      return await Promise.all(
        queues.map(async (queue) => ({
          name: queue.name,
          count: await queue.count(),
          completedCount: await queue.getCompletedCount(),
          failedCount: await queue.getFailedCount(),
          isPaused: await queue.isPaused(),
        })),
      );
    } catch (error) {
      const errorTyped = error as Error;
      throw new BadRequestException(
        `Error retrieving queue information: ${errorTyped.message}`,
      );
    }
  }

  /**
   * Get detail information of a queue
   * @param {string} queueName - The name of the queue to retrieve details for
   * @return {Promise<Queue>} - The queue instance with detailed information
   */
  async getDetailQueue(queueName: string) {
    const queue = this.getQueueName(queueName);

    if (!queue) {
      throw new NotFoundException(`Queue ${queueName} not found`);
    }

    return {
      name: queue.name,
      count: await queue.count(),
      activeCount: await queue.getActiveCount(),
      waitingCount: await queue.getWaitingCount(),
      completedCount: await queue.getCompletedCount(),
      failedCount: await queue.getFailedCount(),
      delayedCount: await queue.getDelayedCount(),
      isPaused: await queue.isPaused(),
    };
  }

  /**
   * Add a job to the queue
   * @param {string} queueName - The name of the queue to add the job to
   * @param {string} id - Unique identifier for the job
   * @param {string} referId - Reference identifier for the job
   * @param {string} fileCode - Code of the file associated with the job
   * @param {DataValue[][]} data - Data to be processed by the job
   * @returns {Promise<void>} - A promise that resolves when the job is added to
   */
  public async addQueue(
    queueName: string,
    id: string,
    referId: string,
    fileCode: string,
    data: DataValue[][],
  ): Promise<void> {
    const queue = this.getQueueName(queueName);

    if (this.isPauseAdd) {
      throw new BadRequestException(
        'Queue is paused, cannot add new jobs at this time.',
      );
    }

    await queue.add(
      'request',
      {
        id,
        referId,
        fileCode,
        data,
      },
      {
        removeOnComplete: 30,
        removeOnFail: 30,
        jobId: id,
        attempts: 0,
      },
    );
  }

  /**
   * Get a list of jobs from the queue
   * @param {string} queueName - The name of the queue to retrieve jobs from
   * @param {number} start - The starting index for the job list
   * @param {number} end - The ending index for the job list
   *
   * @return {Promise<Array<Job>>} - A promise that resolves to an array of jobs
   */
  public async getListJobs(
    queueName: string,
    start: number,
    end: number,
  ): Promise<
    {
      id: string | undefined;
      fileCode: any;
      referId: any;
      queue: string;
      size: any;
    }[]
  > {
    const queue = this.getQueueName(queueName);

    const jobs = await queue.getJobs(undefined, start, end, true);
    const total = await queue.count();

    return jobs.map((job) => {
      return {
        total: total,
        id: job.id,
        fileCode: job.data.fileCode,
        referId: job.data.referId,
        queue: job.queueQualifiedName,
        size: job.data.data.reduce((currentValue, item) => {
          return currentValue + item.length;
        }, 0),
        timestamp: job.timestamp,
      };
    });
  }

  // /**
  //  * Get detail of a job by its ID
  //  * @param {string} id - The ID of the job to retrieve
  //  * @return {Promise<Job>} - A promise that resolves to the job details
  //  */
  // public async getDetailJob(id: string): Promise<Job> {
  //   const job = (await this.queueExcelSimple.getJob(id)) as Job;
  //   if (!job) {
  //     throw new NotFoundException(`Job with ID ${id} not found`);
  //   }
  //   return job;
  // }
  //
  // /**
  //  * Delete all jobs in the queue
  //  * @return {Promise<void>} - A promise that resolves when all jobs are deleted
  //  */
  // public async deleteAllJobs(): Promise<void> {
  //   const jobs = (await this.queueExcelSimple.getJobs()) as Array<Job>;
  //
  //   for (const job of jobs) {
  //     await job.remove();
  //   }
  // }
  //
  // /**
  //  * Delete a job by its ID
  //  * @param {string} id - The ID of the job to delete
  //  * @return {Promise<void>} - A promise that resolves when the job is deleted
  //  */
  // public async deleteJobById(id: string): Promise<void> {
  //   const job = (await this.queueExcelSimple.getJob(id)) as Job;
  //   if (!job) {
  //     throw new NotFoundException(`Job with ID ${id} not found`);
  //   }
  //   await job.remove();
  // }
  //
  // /**
  //  * Get status of the queue
  //  */
  // public async getQueueStatus(): Promise<{
  //   isPaused: boolean;
  //   isPausedAdd: boolean;
  // }> {
  //   return {
  //     isPaused: await this.queueExcelSimple.isPaused(),
  //     isPausedAdd: this.isPauseAdd,
  //   };
  // }
  //
  // /**
  //  * Pause the queue
  //  *
  //  * @return {Promise<void>} - A promise that resolves when the queue is paused
  //  */
  // public async pause(isPause: boolean): Promise<void> {
  //   const nowStatus = await this.queueExcelSimple.isPaused();
  //   if (nowStatus === isPause) {
  //     throw new BadRequestException(
  //       `Queue is already ${isPause ? 'paused' : 'running'}.`,
  //     );
  //   }
  //
  //   if (!isPause) {
  //     await this.queueExcelSimple.resume();
  //   } else {
  //     await this.queueExcelSimple.pause();
  //   }
  // }
  //
  // /**
  //  * Pause adding new jobs to the queue
  //  *
  //  * @return {Promise<void>} - A promise that resolves when adding new jobs is paused
  //  */
  // public pauseAdd(isPause: boolean): void {
  //   if (this.isPauseAdd === isPause) {
  //     throw new BadRequestException(
  //       `Adding new jobs is already ${isPause ? 'paused' : 'enabled'}.`,
  //     );
  //   }
  //
  //   this.isPauseAdd = isPause;
  //
  //   if (!isPause) {
  //     // If resuming, we can add logic here if needed
  //   } else {
  //     // If pausing, we can add logic here if needed
  //   }
  // }
}
