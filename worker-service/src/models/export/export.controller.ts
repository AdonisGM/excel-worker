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
    const a = await this.exportService.processExport(code, data);

    return {};
  }
}
