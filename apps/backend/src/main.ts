/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

// if (process.env.NODE_ENV != 'production') {
//   // keycloak connect library didn't procide a way to pass https Agent during api interaction
//   // so this is what we gonna do in develop environment
//   process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// }
// require('request').defaults({ rejectUnauthorized: false })

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appModule = app.get(AppModule);
  appModule.configureSwagger(app);
  // const globalPrefix = 'api';
  // app.setGlobalPrefix(globalPrefix);
  // app.use(helmet());
  appModule.configureSwagger(app);
  app.use(cookieParser());
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/`); //${globalPrefix}
}

bootstrap();
