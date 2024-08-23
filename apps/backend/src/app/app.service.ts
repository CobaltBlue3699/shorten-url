import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  getProtocol() {
    return this.configService.get('PROTOCOL') || 'https';
  }

  getHost() {
    return this.configService.get('HOST') || 'www.example.com';
  }

  getPort() {
    return Number(this.configService.get('PORT') || 443);
  }
}
