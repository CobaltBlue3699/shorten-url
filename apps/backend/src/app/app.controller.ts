import { Controller, Get } from '@nestjs/common';
import { Unprotected } from '@shorten-url/keycloak-connect';
import { ApiGlobalResponse } from './core/response.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { AppConfigService } from './app.service';

export class AppInfo {
  @ApiProperty()
  protocol: string;
  @ApiProperty()
  host: string;
  @ApiProperty()
  port: string;
  @ApiProperty()
  baseURL: string;
}

@Controller()
export class AppController {
  constructor(private appConfigService: AppConfigService) {}

  @Get('/config')
  @ApiGlobalResponse('Get Server configuration', AppInfo)
  @Unprotected()
  getConfig() {
    const host = this.appConfigService.getHost();
    const protocol = this.appConfigService.getProtocol();
    const port = this.appConfigService.getPort();
    let baseURL = `${this.appConfigService.getProtocol()}://${this.appConfigService.getHost()}`;
    if (![443, 80].some((p) => p === port) && process.env.NODE_ENV != 'production') {
      baseURL += `:${port}`;
    }
    return {
      protocol,
      host,
      port,
      baseURL,
    };
  }
}
