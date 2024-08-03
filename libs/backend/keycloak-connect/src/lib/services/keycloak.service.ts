import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { KEYCLOAK_CONNECT_OPTIONS } from '../constants';
import { KeycloakConnectOptions } from '../interface/keycloak-connect-options.interface';

export type LoginResponse = {
  access_token: string;
  scope: string;
  refresh_token: string;
  token_type: string;
  session_state: string;
  'not-before-policy': number;
  refresh_expires_in: number;
  expires_in: number;
};

export type UserInfoResponse = {
  sub: string;
  email_verified: boolean;
  preferred_username: string;
};

@Injectable()
export class KeycloakService {
  private readonly logger = new Logger(KeycloakService.name);

  private baseURL: string;
  private realm: string;
  private clientId: string;
  private clientSecret: string;

  constructor(
    @Inject(KEYCLOAK_CONNECT_OPTIONS)
    private options: KeycloakConnectOptions,
    private readonly httpService: HttpService
  ) {
    this.baseURL = this.options.authServerUrl || '';
    this.realm = this.options.realm || '';
    this.clientId = this.options.clientId || '';
    this.clientSecret = this.options.secret || '';
  }

  async loginByPassword(username: string, password: string): Promise<LoginResponse> {
    const { data } = await firstValueFrom(
      this.httpService.post(
        `${this.baseURL}/auth/realms/${this.realm}/protocol/openid-connect/token`,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'password',
          username,
          password,
        })
      )
    );

    return data;
  }

  async codeExchangeToken(code: string, redirectURL: string): Promise<LoginResponse> {
    const { data } = await firstValueFrom(
      this.httpService
        .post(
          `${this.baseURL}/realms/${this.realm}/protocol/openid-connect/token`,
          new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'authorization_code',
            redirect_uri: redirectURL,
            code,
          })
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.message, error.cause);
            throw 'An error happened!';
          })
        )
    );
    return data;
  }

  async getUserInfo(accessToken: string): Promise<UserInfoResponse> {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.baseURL}/auth/realms/${this.realm}/protocol/openid-connect/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    );

    return data;
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const { data } = await firstValueFrom(
      this.httpService.post(
        `${this.baseURL}/auth/realms/${this.realm}/protocol/openid-connect/token`,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        })
      )
    );

    return data;
  }

  async logout(refreshToken: string) {
    await firstValueFrom(
      this.httpService.post(
        `${this.baseURL}/auth/realms/${this.realm}/protocol/openid-connect/logout`,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
        })
      )
    );
  }
}
