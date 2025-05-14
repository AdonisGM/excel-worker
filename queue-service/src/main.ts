import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { subDomainCheck } from './common/regex';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { LoggerService } from './models/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // const customLogger = app.get(LoggerService);
  // app.useLogger(customLogger);

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

  await app.listen(3000);
}

bootstrap();
