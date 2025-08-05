import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullMQService } from './bullmq.service';
import { BullMQController } from './bullmq.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'queue_excel_bo_01',
      defaultJobOptions: {
        removeOnComplete: 30,
        removeOnFail: 30,
      },
    }),
    BullModule.registerQueue({
      name: 'queue_excel_bo_02',
      defaultJobOptions: {
        removeOnComplete: 30,
        removeOnFail: 30,
      },
    }),
    BullModule.registerQueue({
      name: 'queue_word_bo_01',
      defaultJobOptions: {
        removeOnComplete: 30,
        removeOnFail: 30,
      },
    }),
    BullModule.registerQueue({
      name: 'queue_word_bo_02',
      defaultJobOptions: {
        removeOnComplete: 30,
        removeOnFail: 30,
      },
    }),
    BullModule.registerQueue({
      name: 'queue_excel_fo_01',
      defaultJobOptions: {
        removeOnComplete: 30,
        removeOnFail: 30,
      },
    }),
    BullModule.registerQueue({
      name: 'queue_word_fo_01',
      defaultJobOptions: {
        removeOnComplete: 30,
        removeOnFail: 30,
      },
    }),
    BullModule.registerQueue({
      name: 'queue_excel_vsms_01',
      defaultJobOptions: {
        removeOnComplete: 30,
        removeOnFail: 30,
      },
    }),
    BullModule.registerQueue({
      name: 'queue_word_vsms_01',
      defaultJobOptions: {
        removeOnComplete: 30,
        removeOnFail: 30,
      },
    }),
  ],
  controllers: [BullMQController],
  providers: [BullMQService],
  exports: [BullMQService],
})
export class BullMQModule {}
