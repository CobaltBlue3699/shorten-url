import { Body, Controller, Get, Inject, Optional, Param, Post, Query, Res } from '@nestjs/common';
import { ShortenUrlService } from './shorten-url.service';
import { AuthenticatedUser, JwtUser, Public, Roles, Unprotected } from '@shorten-url/keycloak-connect';
import { Role } from '../core/role.enum'

// export class PreviewUrlRequest {
//   url: string;
// }

@Controller('/s')
export class ShortenUrlController {

  constructor (@Inject() private service: ShortenUrlService) {}

  @Get()
  @Roles({ roles: [Role.User] })
  async getUserShortUrls(
    @AuthenticatedUser() user: JwtUser,
  ) {
    return this.service.getUserShortUrls(user.sub)
  }

  @Get(':key')
  @Unprotected()
  async redirect(
    @Res() res,
    @Param('key') key:string,
  ) {
    const shortUrl = await this.service.getShortUrl(key);
    if (shortUrl) {
      // maybe do it in cron job ?
      await this.service.updateUsageCount(key);
      res.redirect(shortUrl.originalUrl);
    } else {
      res.status(404).send('Short URL not found');
    }
  }

  @Post()
  @Roles({ roles: [Role.User] })
  async process(
    @AuthenticatedUser() user: JwtUser,
    @Body('originalUrl') originalUrl: string
  ) {
    return this.service.createShortUrl(originalUrl, user.sub)
  }

}
