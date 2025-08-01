import { Module } from '@nestjs/common';
import { BullMQModule } from '../bullmq/bullmq.module';
import { ControlService } from './control.service';
import { ControlController } from './control.controller';

@Module({
  imports: [BullMQModule],
  controllers: [ControlController],
  providers: [ControlService],
  exports: [ControlService],
})
export class ControlModule {}
