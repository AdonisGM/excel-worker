import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'node:fs';
import { LoggerService } from '../logger/logger.service';
import { UtilService } from '../util/util.service';

@Injectable()
export class FileService {
  constructor(
    private readonly logger: LoggerService,
    private readonly utilService: UtilService,
  ) {}

  /**
   * Get the result file by its name.
   * @param {string} fileName - The name of the file to retrieve.
   * @return {fs.ReadStream} A readable stream of the file.
   */
  public async getFileResult(fileName: string): Promise<fs.ReadStream> {
    const filePath = `results/${fileName}`;

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`File ${fileName} does not exist.`);
    }

    return fs.createReadStream(filePath);
  }

  /**
   * Get the template file by its name.
   * @param {string} fileName - The name of the file to retrieve.
   * @return {fs.ReadStream} A readable stream of the file.
   */
  public async getFileTemplate(fileName: string): Promise<fs.ReadStream> {
    const filePath = `templates/${fileName}`;

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Template ${fileName} does not exist.`);
    }

    return fs.createReadStream(filePath);
  }

  /**
   * Get the list of file templates.
   * @return {Promise<void>} A promise that resolves when the list is retrieved.
   * @throws {Error} If the file retrieval fails.
   */
  public async getListFileTemplates(
    search?: string,
  ): Promise<{ name: string; code: string }[]> {
    // Check if the templates directory exists
    if (!fs.existsSync('templates')) {
      throw new BadRequestException('Templates directory does not exist.');
    }

    // Read the files in the templates directory
    const files = await fs.promises.readdir('templates');

    // Log the names of the files found
    return files
      .filter((file) => {
        return !search || file.toUpperCase().includes(search.toUpperCase());
      })
      .map((file) => {
        return {
          name: file,
          code: file.split('.')[0],
        };
      });
  }

  /**
   * Uploads a file template.
   * @param {Express.Multer.File} file - The file to be uploaded.
   * @return {Promise<{ code: string; file: string }>} A promise that resolves with the name of the uploaded file.
   * @throws {Error} If the file upload fails.
   */
  public async uploadFileTemplate(
    file: Express.Multer.File,
  ): Promise<{ code: string; file: string }> {
    this.checkValidFile(file);

    // Save file
    if (!fs.existsSync('templates')) {
      await fs.promises.mkdir('templates', { recursive: true });
    }

    // checks if the file already exists
    const filePath = `templates/${file.originalname}`;
    if (fs.existsSync(filePath)) {
      // Delete the existing file
      await fs.promises.unlink(filePath);
    }

    // Write the file to the disk
    await fs.promises.writeFile(filePath, file.buffer);

    this.logger.log(`Successfully uploading templates... ${file.originalname}`);

    return {
      code: file.originalname.split('.')[0],
      file: file.originalname,
    };
  }

  /**
   * Uploads a file result.
   * @param {string} id - The ID of the file upload.
   * @param {string} refer - The reference for the file upload.
   * @param {Express.Multer.File} file - The file to be uploaded.
   * @return {Promise<void>} A promise that resolves with the name of the uploaded file.
   * @throws {Error} If the file upload fails.
   */
  public async uploadFileResult(
    id: string,
    refer: string,
    file: Express.Multer.File,
  ): Promise<void> {
    // Save file
    if (!fs.existsSync('results')) {
      await fs.promises.mkdir('results', { recursive: true });
    }

    // checks if the file already exists
    const fileName = `${this.utilService.convertDateToString(new Date(), 'yyyy-MM-dd_HH-mm-ss-SSS')}_${file.originalname}`;
    const filePath = `results/${fileName}`;
    if (fs.existsSync(filePath)) {
      // Delete the existing file
      await fs.promises.unlink(filePath);
    }

    // Write the file to the disk
    await fs.promises.writeFile(filePath, file.buffer);

    this.logger.log(
      `Successfully export file ID ${id} with refer ${refer}... ${filePath}`,
    );
  }

  /**
   * Check file is Word or Excel. (Only for docx and xlsx)
   * Check file name only from a-z, A-Z, 0-9, and underscore.
   *
   * @param {Express.Multer.File} file - The file to validate.
   * @return {boolean} True if the file is valid, false otherwise.
   * @private
   */
  private checkValidFile(file: Express.Multer.File): boolean {
    const validMimeTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    const validExtensions = ['docx', 'xlsx'];

    const regex = new RegExp(`^[a-zA-Z0-9_-]+$`);

    if (!file || !file.mimetype) {
      return false;
    }

    const splitNameFile = file.originalname.split('.');
    if (splitNameFile.length < 2) {
      throw new BadRequestException('No extension found in file name');
    }

    const extension = splitNameFile[splitNameFile.length - 1].toLowerCase();
    if (!validExtensions.includes(extension)) {
      throw new BadRequestException(`Invalid file extension: ${extension}`);
    }

    const nameFile = splitNameFile.slice(0, -1).join('');
    if (!regex.test(nameFile)) {
      throw new BadRequestException(
        'File name contains invalid characters. Only a-z, A-Z, 0-9, underscore, and hyphen are allowed.',
      );
    }

    // Check if the file mimetype is valid
    if (!file.mimetype || !validMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed types are: ${validMimeTypes.join(', ')}`,
      );
    }

    return validMimeTypes.includes(file.mimetype);
  }
}
