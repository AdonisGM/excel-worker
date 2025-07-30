// Author: AdonisGM - Nguyen Manh Tung
import { Module } from '@nestjs/common';
import { ExportService } from '../export/export.service';
import { BullModule } from '@nestjs/bullmq';
import { BullMQConsumer } from './bullmq.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'queue_excel_simple',
    }),
  ],
  controllers: [],
  providers: [BullMQConsumer, ExportService],
  exports: [],
})
export class BullMQModule {}
