import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DataValue, QueueData } from '../excel/excel.type';

@Injectable()
export class BullMQService {
  private isPauseAdd: {
    name: string;
    isPaused: boolean;
  }[] = [];

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
  ) {
    const queueList = [
      'queue_excel_bo_01',
      'queue_excel_bo_02',
      'queue_word_bo_01',
      'queue_word_bo_02',
      'queue_excel_fo_01',
      'queue_word_fo_01',
      'queue_excel_vsms_01',
      'queue_word_vsms_01',
    ];
    this.isPauseAdd = queueList.map((name) => ({
      name,
      isPaused: false,
    }));
  }

  /**
   * Set pause/resume status for adding jobs to a queue.
   * @param queueName Queue name.
   * @param isPaused true: pause add; false: allow add.
   */
  public setPauseAdd(queueName: string, isPaused: boolean): void {
    const found = this.isPauseAdd.findIndex((q) => q.name === queueName);
    if (found === -1) {
      this.isPauseAdd.push({ name: queueName, isPaused });
    } else {
      this.isPauseAdd[found].isPaused = isPaused;
    }
  }

  /**
   * Pause or resume the actual processing of the queue (not just adding).
   * @param queueName
   * @param isPaused true: pause queue, false: resume
   */
  public async setQueuePause(
    queueName: string,
    isPaused: boolean,
  ): Promise<void> {
    const queue = this.getQueueName(queueName);
    const currentlyPaused = await queue.isPaused();
    if (isPaused && !currentlyPaused) {
      await queue.pause();
    } else if (!isPaused && currentlyPaused) {
      await queue.resume();
    }
  }

  /**
   * Check if adding jobs to the given queue is currently paused.
   * @param queueName Queue name.
   * @returns boolean indicating paused status
   */
  private isQueueAddPaused(queueName: string): boolean {
    const found = this.isPauseAdd.find((q) => q.name === queueName);
    return found ? found.isPaused : false;
  }

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

    if (this.isQueueAddPaused(queueName)) {
      throw new BadRequestException(
        `Queue "${queueName}" is currently paused. Cannot add new jobs at this time.`,
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

  /**
   * Remove all jobs from the queue (waiting, active, completed, failed, delayed)
   * @param queueName Name of the queue
   */
  public async clearQueue(queueName: string): Promise<void> {
    const queue = this.getQueueName(queueName);
    await queue.drain(true); // remove all waiting and delayed jobs
    await queue.clean(0, 0, 'completed');
    await queue.clean(0, 0, 'failed');
    await queue.clean(0, 0, 'delayed');
    await queue.clean(0, 0, 'active');
    // Repeat for waiting in case
    await queue.clean(0, 0, 'wait');
  }

  /**
   * Delete a job by ID from the specified queue.
   * @param queueName Name of the queue
   * @param jobId Job ID
   */
  public async deleteJobById(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueueName(queueName);
    const job = await queue.getJob(jobId);
    if (!job) {
      throw new NotFoundException(
        `Job with ID ${jobId} not found in queue ${queueName}`,
      );
    }
    await job.remove();
  }
}
