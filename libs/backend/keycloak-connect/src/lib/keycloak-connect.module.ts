import { DynamicModule, Logger, Module } from '@nestjs/common';
import {
  ConfigurableModuleClass,
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN,
} from './keycloak-connect.definition';
import { KEYCLOAK_CONNECT_OPTIONS, KEYCLOAK_INSTANCE, TokenValidation } from './constants';
import { KeycloakConnectOptions } from './keycloak-connect.module';
import KeycloakConnect = require('keycloak-connect');
import path = require('path');
import fs = require('fs');
import { NestKeycloakConfig } from './keycloak-connect.module';
import { KeycloakService } from './services/keycloak.service';
import { AuthGuard } from './guards/auth.guard';
import { ResourceGuard } from './guards/resource.guard';
import { RoleGuard } from './guards/role.guard';
import { KeycloakController } from './controller/keycloak.controller';
import { AuthService } from './services/auth.service';
import { JsonUtils } from './util';

export * from './constants';
export * from './decorators/authenticated-user.decorator';
export * from './decorators/enforcer-options.decorator';
export * from './decorators/public.decorator';
export * from './decorators/resource.decorator';
export * from './decorators/roles.decorator';
export * from './decorators/scopes.decorator';
export * from './guards/auth.guard';
export * from './guards/resource.guard';
export * from './guards/role.guard';
export * from './interface/keycloak-connect-options.interface';
export * from './interface/role-decorator-options.interface';
export * from './services/keycloak.service';
export * from './filter/unauthorized.filter';

@Module({
  providers: [
    {
      provide: KEYCLOAK_CONNECT_OPTIONS,
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: (options: KeycloakConnectOptions, config?: NestKeycloakConfig) => {
        if (typeof options === 'string') {
          const configPathRelative = path.join(__dirname, options);
          const configPathRoot = path.join(process.cwd(), options);

          let configPath: string;

          if (fs.existsSync(configPathRelative)) {
            configPath = configPathRelative;
          } else if (fs.existsSync(configPathRoot)) {
            configPath = configPathRoot;
          } else {
            throw new Error(`Cannot find files, looked in [ ${configPathRelative}, ${configPathRoot} ]`);
          }

          const json = fs.readFileSync(configPath);
          const keycloakConfig = JsonUtils.fromJson<KeycloakConnectOptions>(json.toString());
          return Object.assign(keycloakConfig, config);
        }
        return options;
      },
    },
    {
      provide: KEYCLOAK_INSTANCE,
      useFactory: (opts: KeycloakConnectOptions) => {
        const keycloakOpts: any = opts;
        const keycloak: any = new KeycloakConnect({}, keycloakOpts);

        // Warn if using token validation none
        if (typeof opts !== 'string' && opts.tokenValidation && opts.tokenValidation === TokenValidation.NONE) {
          KeycloakConnectModule.logger.warn(
            `Token validation is disabled, please only do this on development/special use-cases.`
          );
        }

        // Access denied is called, add a flag to request so our resource guard knows
        keycloak.accessDenied = (req: any, res: any, next: any) => {
          req.resourceDenied = true;
          next();
        };

        return keycloak;
      },
      inject: [KEYCLOAK_CONNECT_OPTIONS],
    },
    KeycloakService,
    AuthService,
    AuthGuard,
    ResourceGuard,
    RoleGuard,
  ],
  exports: [
    KEYCLOAK_CONNECT_OPTIONS,
    KEYCLOAK_INSTANCE,
    // KeycloakService,
    AuthGuard,
    ResourceGuard,
    RoleGuard,
  ],
  controllers: [KeycloakController],
})
export class KeycloakConnectModule extends ConfigurableModuleClass {
  static logger = new Logger(KeycloakConnectModule.name);
}
