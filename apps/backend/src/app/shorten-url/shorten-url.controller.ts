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
    const shortURL = await this.service.getShortUrl(key)
    const { originalUrl } = await this.service.updateShortUrl(shortURL.shortUrl, { ...shortURL, usageCount: shortURL.usageCount + 1 })
    res.redirect(originalUrl)
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
