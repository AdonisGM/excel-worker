// Author: AdonisGM - Nguyen Manh Tung
import { Body, Controller, Post } from '@nestjs/common';
import { ExportService } from './export.service';
import { ZodValidationPipe } from '../../zod/zod.pipe';
import { TestDto, testSchema } from './export.zod';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('test')
  async processExport(
    @Body(new ZodValidationPipe(testSchema)) testDto: TestDto,
  ) {
    const { code, data } = testDto;

    // for (let i = 0; i < 500; i++) {
    const pathFile = await this.exportService.processExport(code, data);
    //   console.log('pathFile', pathFile);
    // }

    return {
      status: 'success',
      message: 'Export processed successfully',
      data: {
        pathFile,
      },
    };
  }
}
