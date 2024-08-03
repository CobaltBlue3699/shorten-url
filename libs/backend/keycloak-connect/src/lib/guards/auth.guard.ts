import { CanActivate, ExecutionContext, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as KeycloakConnect from 'keycloak-connect';
import {
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_COOKIE_DEFAULT,
  KEYCLOAK_INSTANCE,
  KEYCLOAK_REFRESH_COOKIE_DEFAULT,
  // KEYCLOAK_LOGGER,
  TokenValidation,
} from '../constants';
import { META_SKIP_AUTH, META_UNPROTECTED } from '../decorators/public.decorator';
import { KeycloakConnectOptions } from '../interface/keycloak-connect-options.interface';
import { extractRequest, parseToken } from '../util';
import { KeycloakConnectModule } from '../keycloak-connect.module';
// import { Response } from 'express';
// import { AuthService } from '../services/auth.service';

/**
 * An authentication guard. Will return a 401 unauthorized when it is unable to
 * verify the JWT token or Bearer header is missing.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    private keycloak: KeycloakConnect.Keycloak,
    @Inject(KEYCLOAK_CONNECT_OPTIONS)
    private keycloakOpts: KeycloakConnectOptions,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isUnprotected = this.reflector.getAllAndOverride<boolean>(META_UNPROTECTED, [
      context.getClass(),
      context.getHandler(),
    ]);
    const skipAuth = this.reflector.getAllAndOverride<boolean>(META_SKIP_AUTH, [
      context.getClass(),
      context.getHandler(),
    ]);

    // If unprotected is set skip Keycloak authentication
    if (isUnprotected && skipAuth) {
      return true;
    }

    // Extract request/response
    const [request, response] = extractRequest(context);

    // if is not an HTTP request ignore this guard
    if (!request) {
      return true;
    }

    const cookieKey = this.keycloakOpts.cookieKey || KEYCLOAK_COOKIE_DEFAULT;
    const refreshKey = this.keycloakOpts.refreshCookieKey || KEYCLOAK_REFRESH_COOKIE_DEFAULT;

    const jwt = this.getCookie(cookieKey, request.cookies) ?? this.extractJwt(request.headers);
    const isJwtEmpty = jwt === null || jwt === undefined;

    const refreshToken = this.getCookie(refreshKey, request.cookies);

    // Empty jwt, but skipAuth = false, isUnprotected = true allow fallback
    if (isJwtEmpty && !skipAuth && isUnprotected) {
      KeycloakConnectModule.logger.verbose(
        'Empty JWT, skipAuth disabled, and a publicly marked route, allowed for fallback'
      );
      return true;
    }

    // Empty jwt given, immediate return
    if (isJwtEmpty) {
      KeycloakConnectModule.logger.verbose('Empty JWT, unauthorized');
      throw new UnauthorizedException();
    }

    KeycloakConnectModule.logger.verbose(`User JWT: ${jwt}`);
    // start validate token
    let isValidToken = false;
    const tokenValidation = this.keycloakOpts.tokenValidation || TokenValidation.ONLINE;

    const gm = this.keycloak.grantManager;
    let grant: KeycloakConnect.Grant;
    try {
      grant = await gm.createGrant({
        access_token: jwt as any,
        refresh_token: refreshToken as any,
      });
    } catch (ex) {
      KeycloakConnectModule.logger.warn(`Cannot validate access token: ${ex}`);
      // It will fail to create grants on invalid access token (i.e expired or wrong domain)
      throw new UnauthorizedException();
    }
    // these can be updated when access token is expired and refresh token not
    const token = grant.access_token;
    const refresh = grant.refresh_token;

    KeycloakConnectModule.logger.verbose(`Using token validation method: ${tokenValidation.toUpperCase()}`);

    try {
      let result: boolean | (string | KeycloakConnect.Token);

      switch (tokenValidation) {
        case TokenValidation.ONLINE:
          result = await gm.validateAccessToken(token as KeycloakConnect.Token);
          isValidToken = result === token;
          break;
        case TokenValidation.OFFLINE:
          result = await gm.validateToken(token as KeycloakConnect.Token, 'Bearer');
          isValidToken = result === token;
          break;
        case TokenValidation.NONE:
          isValidToken = true;
          break;
        default:
          KeycloakConnectModule.logger.warn(`Unknown validation method: ${tokenValidation}`);
          isValidToken = false;
          break;
      }
    } catch (ex) {
      KeycloakConnectModule.logger.warn(`Cannot validate access token: ${ex}`);
      isValidToken = false;
    }
    // end validate
    if (isValidToken) {
      const tokenJWT = (token as any).token;
      const refreshJWT = (refresh as any).token;
      // Attach user info object
      request.user = parseToken(tokenJWT);
      // Attach raw access token JWT extracted from bearer/cookie
      request.accessTokenJWT = tokenJWT;
      request.refreshTokenJWT = refreshJWT;

      if (tokenJWT !== jwt) {
        response.cookie(cookieKey, tokenJWT, {
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
        });
      }
      if (refreshJWT !== refreshToken) {
        response.cookie(refreshKey, refreshJWT, {
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
        });
      }

      KeycloakConnectModule.logger.verbose(`Authenticated User: ${JSON.stringify(request.user)}`);
      return true;
    }
    throw new UnauthorizedException();
  }

  private extractJwt(headers: { [key: string]: string }) {
    if (headers && !headers['authorization']) {
      KeycloakConnectModule.logger.verbose(`No authorization header`);
      return null;
    }

    const auth = headers['authorization'].split(' ');

    // We only allow bearer
    if (auth[0].toLowerCase() !== 'bearer') {
      KeycloakConnectModule.logger.verbose(`No bearer header`);
      return null;
    }

    return auth[1];
  }

  private getCookie(key: string, cookies: { [key: string]: string }) {
    return cookies && cookies[key];
  }
}
