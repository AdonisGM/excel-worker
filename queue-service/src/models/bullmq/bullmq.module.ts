import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullMQService } from './bullmq.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'queue_excel_simple',
    }),
  ],
  controllers: [],
  providers: [BullMQService],
  exports: [BullMQService],
})
export class BullMQModule {}
