// Author: AdonisGM - Nguyen Manh Tung
import { Module } from '@nestjs/common';
import { ExportService } from '../export/export.service';
import { BullModule } from '@nestjs/bullmq';
import { BullMQConsumer } from './bullmq.consumer';
import { FileService } from '../file/file.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'queue_excel_simple',
    }),
  ],
  controllers: [],
  providers: [BullMQConsumer, ExportService, FileService],
  exports: [],
})
export class BullMQModule {}
