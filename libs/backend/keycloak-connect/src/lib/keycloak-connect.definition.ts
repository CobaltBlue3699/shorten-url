import { ConfigurableModuleBuilder } from '@nestjs/common';
import { KeycloakConnectOptions } from './interface/keycloak-connect-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, ASYNC_OPTIONS_TYPE, OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<KeycloakConnectOptions>()
    // .setClassMethodName('forRoot')
    .build();
