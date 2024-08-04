import { Body, Controller, Get, HttpCode, HttpStatus, Req, Res, Post, Inject, Query, Optional } from '@nestjs/common';
// import { Request, Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { KEYCLOAK_CONNECT_OPTIONS, KEYCLOAK_COOKIE_DEFAULT, KEYCLOAK_REFRESH_COOKIE_DEFAULT } from '../constants';
import { KeycloakConnectOptions } from '../keycloak-connect.module';
import { AuthService } from './../services/auth.service';
import { AuthenticatedUser, JwtUser } from './../decorators/authenticated-user.decorator';

type LoginRequestBody = {
  username: string;
  password: string;
};

type RefreshTokenRequestBody = {
  refresh_token: string;
};

type LogoutRequestBody = {
  refresh_token: string;
};

@Controller(`/auth`)
export class KeycloakController {

  private cookieKey: string;
  private refreshKey: string;

  constructor(
    @Inject(KEYCLOAK_CONNECT_OPTIONS) private opts: KeycloakConnectOptions,
    private readonly authService: AuthService
  ) {
    this.cookieKey = this.opts.cookieKey || KEYCLOAK_COOKIE_DEFAULT;
    this.refreshKey = this.opts.refreshCookieKey || KEYCLOAK_REFRESH_COOKIE_DEFAULT;
  }

  // @Post('/login')
  // @HttpCode(HttpStatus.OK)
  // login(@Body() body: LoginRequestBody) {
  //   const { username, password } = body;

  //   return this.keycloak.login(username, password);
  // }

  // @Post('/reg')
  // @HttpCode(HttpStatus.OK)
  // registration(@Body() body: LoginRequestBody) {
  //   const { username, password } = body;

  //   return this.keycloak.login(username, password);
  // }

  @Get('/login')
  @Public()
  redirectToLoginPage(@Req() req: any, @Res() res: any, @AuthenticatedUser() user: JwtUser) {
    if (user) {
      // already login
      res.redirect(`/`);
    } else {
      const { state } = req.query;
      const { host } = req.headers;
      const uri = req.path.substring(0, req.path.lastIndexOf(`/login`)) + `/code`;
      const redirectURL = `${req.protocol}://${host}${uri}`;
      let url = `${this.opts.authServerUrl}/realms/${this.opts.realm}/protocol/openid-connect/auth`;
      url += `?client_id=${this.opts.clientId}`;
      url += `&response_type=code`;
      url += `&scope=openid`;
      url += `&redirect_uri=${redirectURL}`;
      if (state) {
        url += `&state=${state}`;
      }
      res.redirect(url);
    }
  }

  @Get('/me')
  getProfile(@AuthenticatedUser() user: JwtUser) {
    return user;
  }

  @Public()
  @Get('/code')
  @HttpCode(HttpStatus.OK)
  async code(
    @Req() req: any,
    @Res() res: any,
    @Query('code') code: string,
    @Optional()
    @Query('state') state: string
  ) {
    const { host } = req.headers;
    const redirectURL = `${req.protocol}://${host}${req.path}`;
    const resp = await this.authService.codeExchangeToken(code as string, redirectURL);

    res.cookie(this.cookieKey, `${resp.access_token}`, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
    });
    res.cookie(this.refreshKey, `${resp.refresh_token}`, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
    });
    // res.cookie(refreshKey, `${resp.token_type} ${resp.refresh_token}`);
    res.redirect(`/`);
  }

  // @Post('/refresh')
  // @HttpCode(HttpStatus.OK)
  // refreshToken(@Body() body: RefreshTokenRequestBody) {
  //   const { refresh_token: refreshToken } = body;

  //   return this.keycloak.refreshToken(refreshToken);
  // }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any, @Res() res: any) {
    const { refreshTokenJWT } = req;
    res.clearCookie(this.cookieKey);
    res.clearCookie(this.refreshKey);
    await this.authService.logout(refreshTokenJWT);
    res.json({
      status: 200,
      message: 'logout!'
    })
  }
}
