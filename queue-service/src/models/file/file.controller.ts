import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { UtilService } from '../util/util.service';
import { Response } from 'express';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly utilService: UtilService,
  ) {}

  @Get('/download/result/:fileName')
  async downloadFileResult(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    if (!fileName) {
      throw new BadRequestException('File name is required');
    }

    const streamFile = await this.fileService.getFileResult(fileName);

    streamFile.pipe(res);
  }

  @Get('/download/template/:fileName')
  async downloadFileTemplate(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    if (!fileName) {
      throw new BadRequestException('File name is required');
    }

    const streamFile = await this.fileService.getFileTemplate(fileName);

    streamFile.pipe(res);
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
