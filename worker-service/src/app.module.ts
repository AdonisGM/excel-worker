// Author: AdonisGM - Nguyen Manh Tung
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppBootstrapService } from './app.bootstrap';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './models/logger/logger.module';
import { ExportModule } from './models/export/export.module';
import { UtilModule } from './models/util/util.module';

@Module({
  imports: [ConfigModule.forRoot(), LoggerModule, UtilModule, ExportModule],
  controllers: [AppController],
  providers: [AppBootstrapService, AppService],
})
export class AppModule {}
