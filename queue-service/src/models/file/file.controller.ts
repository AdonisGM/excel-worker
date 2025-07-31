import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { UtilService } from '../util/util.service';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly utilService: UtilService,
  ) {}

  @Get('/download/result')
  async downloadFileResult() {
    return { message: 'Download file result success' };
  }

  @Get('/download/template')
  async downloadFileTemplate() {
    return { message: 'Download file template success' };
  }

  @Get('/templates')
  async getListFileTemplate(
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const list = await this.fileService.getListFileTemplates(search);

    return this.utilService.convertToPagination(list, page, limit);
  }

  @Post('/upload/template')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileTemplate(@UploadedFile() file: Express.Multer.File) {
    const fileName = await this.fileService.uploadFileTemplate(file);

    return {
      code: fileName.code,
      file: fileName.file,
      message: 'Upload file template success',
    };
  }

  @Post('/upload/result/:id/:referId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileResult(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Param('referId') referId: string,
  ) {
    await this.fileService.uploadFileResult(id, referId, file);

    return {
      id,
      referId,
      message: 'Upload file success',
    };
  }
}
