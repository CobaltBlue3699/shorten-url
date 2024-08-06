import { Module } from '@nestjs/common';

// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

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
        console.log(configService.get('MONGODB_URL'))
        return {
          uri: configService.get('MONGODB_URL'),
          user: configService.get('MONGODB_USER'),
          pass: configService.get('MONGODB_PASSWORD'),
          retryAttempts: configService.get('MONGODB_RETRY_ATTEMPTS'),
          retryDelay: configService.get('MONGODB_RETRY_DELAY'),
        }
      }
    }),
    ShortenUrlModule,
  ],
  controllers: [],
  providers: [
    // AppService,
    // KeycloakService,
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
  ],
})
export class AppModule {}
