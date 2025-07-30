// Author: AdonisGM - Nguyen Manh Tung
import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';

@Module({
  imports: [],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [],
})
export class ExportModule {}
