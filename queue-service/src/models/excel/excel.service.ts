import { Injectable } from '@nestjs/common';
import { DataValue } from './excel.type';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ExcelService {
  constructor(
    @InjectQueue('queue_excel_simple') private queueExcelSimple: Queue,
  ) {}

  public async generate(
    id: string,
    referId: string,
    fileCode: string,
    data: DataValue[][],
  ) {
    await this.queueExcelSimple.add(
      'request',
      {
        id,
        referId,
        fileCode,
        data,
      },
      {
        removeOnComplete: true,
        removeOnFail: 50,
      },
    );
  }
}
