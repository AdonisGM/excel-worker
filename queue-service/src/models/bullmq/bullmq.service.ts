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
  private isPauseAdd: boolean = false;

  constructor(
    @InjectQueue('queue_excel_simple') private queueExcelSimple: Queue,
  ) {}

  /**
   * Get information count jobs in the queue for dashboard
   * @returns {Promise<{ isPaused: boolean; isPausedAdd: boolean; totalJobs: number; speedAdd: number }>} - An object containing queue status and job statistics
   * @throws {BadRequestException} - If the queue is not initialized or an error occurs
   */
  public async getCountJobs(): Promise<{
    isPaused: boolean;
    isPausedAdd: boolean;
    totalJobs: number;
    speedAdd: number;
  }> {
    const totalJobs = await this.queueExcelSimple.count();

    const now = Date.now();
    const from = now - 60 * 1000;

    // Jobs added in the window
    const allJobs = (await this.queueExcelSimple.getJobs(
      ['waiting', 'active', 'completed', 'failed', 'delayed'],
      0,
      -1,
      true,
    )) as Array<Job>;
    const jobsAdded = allJobs.filter((job) => job.timestamp >= from);

    // Speed add per minute
    const speedAdd = jobsAdded.length;

    return {
      isPaused: await this.queueExcelSimple.isPaused(),
      isPausedAdd: this.isPauseAdd,
      totalJobs,
      speedAdd,
    };
  }

  /**
   * Add a job to the queue
   * @param {string} id - Unique identifier for the job
   * @param {string} referId - Reference identifier for the job
   * @param {string} fileCode - Code of the file associated with the job
   * @param {DataValue[][]} data - Data to be processed by the job
   * @returns {Promise<void>} - A promise that resolves when the job is added to
   */
  public async addQueue(
    id: string,
    referId: string,
    fileCode: string,
    data: DataValue[][],
  ): Promise<void> {
    if (this.isPauseAdd) {
      throw new BadRequestException(
        'Queue is paused, cannot add new jobs at this time.',
      );
    }

    await this.queueExcelSimple.add(
      'request',
      {
        id,
        referId,
        fileCode,
        data,
      },
      {
        removeOnComplete: 50,
        removeOnFail: 50,
        jobId: id,
        attempts: 0,
      },
    );
  }

  /**
   * Get a list of jobs from the queue
   *
   * @param {number} start - The starting index for the job list
   * @param {number} end - The ending index for the job list
   *
   * @return {Promise<Array<Job>>} - A promise that resolves to an array of jobs
   */
  public async getListJobs(
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
    const jobs = (await this.queueExcelSimple.getJobs(
      undefined,
      start,
      end,
      true,
    )) as Array<Job<QueueData, any, string>>;

    return jobs.map((job) => {
      return {
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
   * Get detail of a job by its ID
   * @param {string} id - The ID of the job to retrieve
   * @return {Promise<Job>} - A promise that resolves to the job details
   */
  public async getDetailJob(id: string): Promise<Job> {
    const job = (await this.queueExcelSimple.getJob(id)) as Job;
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  /**
   * Delete all jobs in the queue
   * @return {Promise<void>} - A promise that resolves when all jobs are deleted
   */
  public async deleteAllJobs(): Promise<void> {
    const jobs = (await this.queueExcelSimple.getJobs()) as Array<Job>;

    for (const job of jobs) {
      await job.remove();
    }
  }

  /**
   * Delete a job by its ID
   * @param {string} id - The ID of the job to delete
   * @return {Promise<void>} - A promise that resolves when the job is deleted
   */
  public async deleteJobById(id: string): Promise<void> {
    const job = (await this.queueExcelSimple.getJob(id)) as Job;
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    await job.remove();
  }

  /**
   * Get status of the queue
   */
  public async getQueueStatus(): Promise<{
    isPaused: boolean;
    isPausedAdd: boolean;
  }> {
    return {
      isPaused: await this.queueExcelSimple.isPaused(),
      isPausedAdd: this.isPauseAdd,
    };
  }

  /**
   * Pause the queue
   *
   * @return {Promise<void>} - A promise that resolves when the queue is paused
   */
  public async pause(isPause: boolean): Promise<void> {
    const nowStatus = await this.queueExcelSimple.isPaused();
    if (nowStatus === isPause) {
      throw new BadRequestException(
        `Queue is already ${isPause ? 'paused' : 'running'}.`,
      );
    }

    if (!isPause) {
      await this.queueExcelSimple.resume();
    } else {
      await this.queueExcelSimple.pause();
    }
  }

  /**
   * Pause adding new jobs to the queue
   *
   * @return {Promise<void>} - A promise that resolves when adding new jobs is paused
   */
  public pauseAdd(isPause: boolean): void {
    if (this.isPauseAdd === isPause) {
      throw new BadRequestException(
        `Adding new jobs is already ${isPause ? 'paused' : 'enabled'}.`,
      );
    }

    this.isPauseAdd = isPause;

    if (!isPause) {
      // If resuming, we can add logic here if needed
    } else {
      // If pausing, we can add logic here if needed
    }
  }
}
