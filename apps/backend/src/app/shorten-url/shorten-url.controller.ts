import { Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { ShortenUrlService } from './shorten-url.service';
import { AuthenticatedUser, JwtUser } from '@shorten-url/keycloak-connect';
import { firstValueFrom, of } from 'rxjs';

// export class PreviewUrlRequest {
//   url: string;
// }

@Controller('shorten-url')
export class ShortenUrlController {

  constructor (@Inject() private service: ShortenUrlService) {}

  @Post()
  async generateShortenUrl(@Param('url') url, @AuthenticatedUser() user: JwtUser) {
    return firstValueFrom(of({ url, user }));
  }

  @Get('/preview')
  async urlPreview(@Query('url') url) {
    return this.service.fetchUrlPreview(url);
  }

}
