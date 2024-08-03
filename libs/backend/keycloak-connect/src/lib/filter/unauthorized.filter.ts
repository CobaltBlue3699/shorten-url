import { ArgumentsHost, Catch, ExceptionFilter, Inject, UnauthorizedException } from '@nestjs/common';
// import { Response, Request } from 'express';
import { KEYCLOAK_CONNECT_OPTIONS, KEYCLOAK_COOKIE_DEFAULT, KEYCLOAK_REFRESH_COOKIE_DEFAULT } from '../constants';
import { KeycloakConnectOptions } from '../keycloak-connect.module';

@Catch(UnauthorizedException)
export class UnauthorizedFilter implements ExceptionFilter {
  constructor(
    @Inject(KEYCLOAK_CONNECT_OPTIONS)
    private keycloakOpts: KeycloakConnectOptions
  ) {}

  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    const tokenKey = this.keycloakOpts.cookieKey || KEYCLOAK_COOKIE_DEFAULT;
    const refreshKey = this.keycloakOpts.refreshCookieKey || KEYCLOAK_REFRESH_COOKIE_DEFAULT;
    response.clearCookie(tokenKey);
    response.clearCookie(refreshKey);

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      // cause: exception.cause,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
