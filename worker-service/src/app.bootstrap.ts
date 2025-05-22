// Author: AdonisGM - Nguyen Manh Tung
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from './models/logger/logger.service';

@Injectable()
export class AppBootstrapService implements OnApplicationBootstrap {
  private appId: string;
  private isRegister: boolean = false;
  private isSyncFile: boolean = false;

  constructor(private readonly logger: LoggerService) {}

  async onApplicationBootstrap() {
    this.appId = uuidv4();

    // await this.registerWorker();
    // await this.syncFileTemplate();
  }

  getAppId(): string {
    return this.appId;
  }

  IsRegister(): boolean {
    return this.isRegister;
  }

  private async registerWorker(): Promise<void> {
    // Check URL
    const url = `${process.env.QUEUE_URL}${process.env.QUEUE_URL_REGISTER}`;
    if (!url) {
      this.logger.error(`No URL for ${url}`);
      return;
    }

    const body = {
      appId: this.appId,
      type: process.env.WORKER_TYPE,
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        this.logger.error(`Failed to register worker: ${res.statusText}`);
        return;
      }

      this.isRegister = true;
    } catch (error) {
      this.logger.error(`Failed to register worker: ${error}`);
    }
  }

  private async syncFileTemplate(): Promise<void> {
    // Check URL
    const url = `${process.env.QUEUE_URL}${process.env.QUEUE_URL_SYNC_FILE}`;
    if (!url) {
      this.logger.error(`No URL for ${url}`);
      return;
    }

    const body = {
      appId: this.appId,
      type: process.env.WORKER_TYPE,
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        this.logger.error(`Failed to request sync file: ${res.statusText}`);
        return;
      }
    } catch (error) {
      this.logger.error(`Failed to request sync file: ${error}`);
    }
  }
}
