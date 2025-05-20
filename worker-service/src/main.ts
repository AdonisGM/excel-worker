import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { subDomainCheck } from './common/regex';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { LoggerService } from './models/logger/logger.service';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: false,
  });

  // log
  const logger = app.get(LoggerService);
  app.useLogger(logger);

  logger.log(`============ Starting worker service - Information ============`);
  logger.log(`=> OS: ${process.platform}`);
  logger.log(`=> CPU: ${process.arch}`);
  logger.log(`=> Node: ${process.version}`);
  logger.log(`===============================================================`);

  app.enableCors(
    (req: Request, callback: (err: Error | null, option: object) => any) => {
      const corsOptions = {
        origin: false,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
      };

      const topDomainFe = process.env.TOP_DOMAIN_FE as string;
      const url = req.headers['origin'] as string;
      const isValid = subDomainCheck(topDomainFe, url);

      if (isValid) {
        corsOptions.origin = true;
      }

      callback(null, corsOptions);
    },
  );

  app.use(cookieParser());

  app.disable('x-powered-by');

  // Increase payload size limit (e.g., 100mb)
  app.use(bodyParser.json({ limit: '500mb' }));
  app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));

  await app.listen(3000);
}

bootstrap();
