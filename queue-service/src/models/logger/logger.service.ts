import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

/**
 * Service to log messages, write to console and file.
 */
@Injectable()
export class LoggerService {
  private readonly logger: winston.Logger;
  private readonly folderPath: string = 'logs';

  /**
   * Constructor to initialize the LoggerService
   */
  constructor() {
    const myFormat = winston.format.printf(
      ({
        level,
        message,
        label,
        timestamp,
        className,
      }: {
        level: string;
        message: string;
        label: string;
        timestamp: string;
        className: string;
      }) => {
        return `${timestamp} [${label} - ${className}] ${level}: ${message}`;
      },
    );

    const transport = new winston.transports.DailyRotateFile({
      filename: '%DATE%/info-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '50m',
      maxFiles: '30d',
      dirname: this.folderPath,
    });

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.label({ label: 'AGM' }),
        winston.format.timestamp(),
        myFormat,
      ),
      transports: [new winston.transports.Console(), transport],
    });
  }

  /**
   * Log a message.
   *
   * @param {string} message - The message to log.
   *
   * @return {void}
   */
  public log(message: string): void {
    // get class name call this method
    const stack = new Error().stack;
    const className =
      stack?.split('\n')[2].trim().split(' ')[1] ?? 'UnknownClass';

    this.logger.info({
      className: className,
      message: message,
    });
  }

  /**
   * Log an error message.
   *
   * @param {string} message - The error message to log.
   *
   * @return {void}
   */
  public error(message: string): void {
    // get class name call this method
    const stack = new Error().stack;
    const className =
      stack?.split('\n')[2].trim().split(' ')[1] ?? 'UnknownClass';

    this.logger.error({
      className: className,
      message: message,
    });
  }

  /**
   * Log a warning message.
   *
   * @param {string} message - The warning message to log.
   *
   * @return {void}
   */
  public warn(message: string): void {
    // get class name call this method
    const stack = new Error().stack;
    const className =
      stack?.split('\n')[2].trim().split(' ')[1] ?? 'UnknownClass';

    this.logger.warn({
      className: className,
      message: message,
    });
  }

  /**
   * Log a debug message.
   *
   * @param {string} message - The debug message to log.
   *
   * @return {void}
   */
  public debug(message: string): void {
    // get class name call this method
    const stack = new Error().stack;
    const className =
      stack?.split('\n')[2].trim().split(' ')[1] ?? 'UnknownClass';

    this.logger.debug({
      className: className,
      message: message,
    });
  }

  /**
   * Log a verbose message.
   *
   * @param {string} message - The verbose message to log.
   *
   * @return {void}
   */
  public verbose(message: string): void {
    // get class name call this method
    const stack = new Error().stack;
    const className =
      stack?.split('\n')[2].trim().split(' ')[1] ?? 'UnknownClass';

    this.logger.verbose({
      className: className,
      message: message,
    });
  }
}
