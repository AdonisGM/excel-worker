// Author: AdonisGM - Nguyen Manh Tung
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
      }: {
        level: string;
        message: string;
        label: string;
        timestamp: string;
        className: string;
      }) => {
        return `${timestamp} [${label}] ${level}: ${message}`;
      },
    );

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.label({ label: 'AGM' }),
        winston.format.timestamp(),
        myFormat,
      ),
      transports: [
        new winston.transports.Console(),
        this.createTransports('info'),
        this.createTransports('error'),
        this.createTransports('warn'),
        this.createTransports('debug'),
        this.createTransports('verbose'),
      ],
    });
  }

  /**
   * Create a winston transports
   * @param {string} level - The level of the logger (e.g., 'info', 'error', 'warn', 'debug', 'verbose').
   *
   * @return {winston.Logger} - The winston logger instance.
   */
  public createTransports(level: string): winston.transport {
    return new winston.transports.DailyRotateFile({
      filename: `%DATE%/${level}-%DATE%.log`,
      datePattern: 'YYYY-MM-DD_HH',
      zippedArchive: true,
      maxSize: '50m',
      maxFiles: '30d',
      dirname: this.folderPath,
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
  // public error(message: string): void {
  //   // get class name call this method
  //   const stack = new Error().stack;
  //   const className =
  //     stack?.split('\n')[2].trim().split(' ')[1] ?? 'UnknownClass';
  //
  //   this.logger.error({
  //     className: className,
  //     message: message,
  //   });
  // }

  /**
   * Log an error message.
   *
   *
   * @return {void}
   * @param { Error } e
   */
  public error(e: Error | string): void {
    // get class name call this method
    const stack = new Error().stack;
    const className =
      stack?.split('\n')[2].trim().split(' ')[1] ?? 'UnknownClass';

    if (typeof e === 'string') {
      const newError = new Error(e);
      this.logger.error({
        className: className,
        message: newError.stack,
      });
      return;
    }

    this.logger.error({
      className: className,
      message: e.stack,
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
