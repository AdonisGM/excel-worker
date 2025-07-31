import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import * as fs from 'node:fs';

@Injectable()
export class FileService {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Uploads a file to the main storage.
   * @param {string} id - The ID of the file.
   * @param {string} referId - The reference ID for the file.
   * @param {string} location - The file to be uploaded.
   */
  public async uploadToMain(
    id: string,
    referId: string,
    location: string,
  ): Promise<void> {
    // Get file from location
    const file = await fs.promises.readFile(location);

    const formData = new FormData();
    formData.append('file', new Blob([file]), location.split('/').pop());

    fetch(`http://localhost:4000/v1/file/upload/result/${id}/${referId}`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to upload file');
        }
        return response.json();
      })
      .catch((err) => {
        this.logger.error('Failed to upload file to main storage');
        console.log(err);
      });
  }
}
