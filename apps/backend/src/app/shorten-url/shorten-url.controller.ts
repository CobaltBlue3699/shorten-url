import { Body, Controller, Get, Header, Inject, Optional, Param, Post, Query, Res } from '@nestjs/common';
import { ShortenUrlService } from './shorten-url.service';
import { AuthenticatedUser, JwtUser, Public, Roles, Unprotected } from '@shorten-url/keycloak-connect';
import { Role } from '../core/role.enum'
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { forkJoin, map, tap } from 'rxjs';

// export class PreviewUrlRequest {
//   url: string;
// }

@Controller('/s')
export class ShortenUrlController {

  constructor (
    @Inject() private service: ShortenUrlService,
    @InjectQueue('usage-count') private usageCountQueue: Queue,
  ) {}

  @Get()
  @Roles({ roles: [Role.User] })
  async getUserShortUrls(
    @AuthenticatedUser() user: JwtUser,
  ) {
    return this.service.getUserShortUrls(user.sub)
  }

  @Get('/details/:key')
  @Roles({ roles: [Role.User] })
  async getShortUrlDetails(
    @AuthenticatedUser() user: JwtUser,
    @Param('key') key:string,
  ) {
    return await this.service.getShortUrlDeatils(key)
  }

  @Get(':key')
  @Unprotected()
  async redirect(
    @Res() res,
    @Param('key') key:string,
  ) {
    const shortUrl = await this.service.getShortUrl(key);
    if (shortUrl) {
      // await this.service.updateUsageCount(key);
      await this.usageCountQueue.add({ shortUrl: key });
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
