import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { KeycloakService } from './keycloak.service';

type LoginResponse = {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly keycloakService: KeycloakService) {}

  async login(username: string, password: string): Promise<LoginResponse> {
    const { access_token, expires_in, refresh_token, refresh_expires_in, token_type } = await this.keycloakService
      .loginByPassword(username, password)
      .catch(() => {
        throw new UnauthorizedException();
      });

    return {
      token_type,
      access_token,
      refresh_token,
      expires_in,
      refresh_expires_in,
    };
  }

  async getProfile(accessToken: string) {
    this.logger.log('Getting user profile...');

    return this.keycloakService.getUserInfo(accessToken).catch(() => {
      throw new UnauthorizedException();
    });
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const { access_token, expires_in, refresh_token, refresh_expires_in, token_type } = await this.keycloakService
      .refreshToken(refreshToken)
      .catch(() => {
        throw new UnauthorizedException();
      });

    return {
      token_type,
      access_token,
      refresh_token,
      expires_in,
      refresh_expires_in,
    };
  }

  async codeExchangeToken(code: string, redirectURL: string): Promise<LoginResponse> {
    const { access_token, expires_in, refresh_token, refresh_expires_in, token_type } = await this.keycloakService
      .codeExchangeToken(code, redirectURL)
      .catch(() => {
        throw new UnauthorizedException();
      });

    return {
      token_type,
      access_token,
      refresh_token,
      expires_in,
      refresh_expires_in,
    };
  }

  async logout(refreshToken: string) {
    await this.keycloakService.logout(refreshToken).catch(() => {
      throw new UnauthorizedException();
    });
  }
}
