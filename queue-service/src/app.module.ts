import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from './models/logger/logger.module';
import { UtilModule } from './models/util/util.module';
import { ExcelModule } from './models/excel/excel.module';
import { FileModule } from './models/file/file.module';
import { ControlModule } from './models/control/control.module';
import { BullMQModule } from './models/bullmq/bullmq.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        username: '',
        password: '',
      },
    }),
    LoggerModule,
    UtilModule,
    ExcelModule,
    FileModule,
    ControlModule,
    BullMQModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
