// Author: AdonisGM - Nguyen Manh Tung
import { Injectable } from '@nestjs/common';
import { AppBootstrapService } from './app.bootstrap';

@Injectable()
export class AppService {
  constructor(private readonly appBootstrap: AppBootstrapService) {}

  getHello() {
    const appId = this.appBootstrap.getAppId();
    const pid = process.pid;
    return {
      message: `Welcome to the Worker Service!`,
      appId: appId,
      pid: pid,
      type: process.env.WORKER_TYPE,
    };
  }
}
