import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from './models/logger/logger.module';
import { UtilModule } from './models/util/util.module';
import { ExcelModule } from './models/excel/excel.module';
import { FileModule } from './models/file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: '138.2.105.62',
        port: 6379,
      },
    }),
    LoggerModule,
    UtilModule,
    ExcelModule,
    FileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
