import { Module } from '@nestjs/common';
import { FileService } from './file.service';

@Module({
  imports: [],
  controllers: [],
  providers: [FileService],
  exports: [],
})
export class FileModule {}
