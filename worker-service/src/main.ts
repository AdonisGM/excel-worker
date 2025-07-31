// Author: AdonisGM - Nguyen Manh Tung
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { LoggerService } from './models/logger/logger.service';
import * as bodyParser from 'body-parser';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // log
  const logger = app.get(LoggerService);
  app.useLogger(logger);

  logger.log(`============ Starting worker service - Information ============`);
  logger.log(`=> OS: ${process.platform}`);
  logger.log(`=> CPU: ${process.arch}`);
  logger.log(`=> Node: ${process.version}`);
  logger.log(`===============================================================`);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  app.use(cookieParser());

  app.disable('x-powered-by');

  // Increase payload size limit (e.g., 100mb)
  app.use(bodyParser.json({ limit: '500mb' }));
  app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

  await app.listen(5000);
}

bootstrap();
