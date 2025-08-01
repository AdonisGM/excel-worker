import { Module } from '@nestjs/common';
import { ExcelController } from './excel.controller';
import { ExcelService } from './excel.service';
import { BullMQModule } from '../bullmq/bullmq.module';

@Module({
  imports: [BullMQModule],
  controllers: [ExcelController],
  providers: [ExcelService],
  exports: [],
})
export class ExcelModule {}
