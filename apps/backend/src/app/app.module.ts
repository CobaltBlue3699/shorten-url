import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  AuthGuard,
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
  UnauthorizedFilter,
} from '@shorten-url/keycloak-connect';
import { CoreModule } from './core/core.module';
import { ShortenUrlModule } from './shorten-url/shorten-url.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiExceptionsFilter } from './core/exception.filter';
import { ResponseInterceptor } from './core/response.interceptor';
import { StaticMiddleware } from './core/static.middleware';
import { AppController } from './app.controller';
import { AppConfigService } from './app.service';

console.log(__dirname);
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend/browser'),
    }),
    CoreModule,
    KeycloakConnectModule.registerAsync({
      imports: [ConfigModule, CoreModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          authServerUrl: configService.get('KEYCLOAK_BASE_URL'),
          realm: configService.get('KEYCLOAK_REALM'),
          clientId: configService.get('KEYCLOAK_CLIENT_ID'),
          secret: configService.get('KEYCLOAK_CLIENT_SECRET'),
        };
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        // console.log(configService.get('MONGODB_URL'))
        return {
          uri: configService.get('MONGODB_URL'),
          user: configService.get('MONGODB_USER'),
          pass: configService.get('MONGODB_PASSWORD'),
          retryAttempts: configService.get('MONGODB_RETRY_ATTEMPTS'),
          retryDelay: configService.get('MONGODB_RETRY_DELAY'),
        }
      }
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory(configService: ConfigService) {
          return {
            redis: {
              host: configService.get('REDIS_HOST'),
              port: configService.get('REDIS_PORT'),
            },
          }
      },
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        // console.log(configService.get<number>('CACHE_TTL'));
        return {
          store: redisStore,
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          ttl: Number(configService.get<number>('CACHE_TTL')), // Time to live in seconds
        }
      },
      inject: [ConfigService],
    }),
    ShortenUrlModule,
  ],
  controllers: [AppController],
  providers: [
    AppConfigService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_FILTER,
      useClass: UnauthorizedFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
    },
  ],
})
export class AppModule implements NestModule {

  configureSwagger(app: any) {
    const config = new DocumentBuilder()
      .setTitle('Short URL API')
      .setDescription('API for managing and creating short URLs')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(StaticMiddleware)
      .forRoutes('*');
  }
}
