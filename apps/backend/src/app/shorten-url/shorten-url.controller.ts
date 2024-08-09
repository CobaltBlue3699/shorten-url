import { Body, Controller, Get, Inject, Param, Post, Res } from '@nestjs/common';
import { ShortenUrlService } from './shorten-url.service';
import { AuthenticatedUser, JwtUser, Roles, Unprotected } from '@shorten-url/keycloak-connect';
import { Role } from '../core/role.enum';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, PickType } from '@nestjs/swagger';
import { ShortUrl } from './schemas/shorten-url.schema';

export class CreateShortUrlReq extends PickType(ShortUrl, ['originalUrl'] as const) {}

@ApiTags('Shorten URLs')
@Controller('/s')
export class ShortenUrlController {
  constructor(
    @Inject() private service: ShortenUrlService,
    @InjectQueue('usage-count') private usageCountQueue: Queue
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get User Short URLs' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of short URLs for the authenticated user.',
    type: [ShortUrl]
  })
  @ApiBearerAuth() // means api need Bearer token
  @Roles({ roles: [Role.User] })
  async getUserShortUrls(@AuthenticatedUser() user: JwtUser): Promise<ShortUrl[]> {
    return this.service.getUserShortUrls(user.sub);
  }

  @Get('/details/:key')
  @ApiOperation({ summary: 'Get Short URL Details' })
  @ApiResponse({
    status: 200,
    description: 'Returns details of the specified short URL.',
    type: ShortUrl
  })
  @ApiResponse({ status: 404, description: 'Short URL not found.' })
  @ApiParam({
    name: 'key',
    description: 'The unique key representing the short URL.',
    example: 'v5nXypS',
  })
  @ApiBearerAuth()
  @Roles({ roles: [Role.User] })
  async getShortUrlDetails(@AuthenticatedUser() user: JwtUser, @Param('key') key: string) {
    return await this.service.getShortUrlDeatils(key);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Redirect to Original URL' })
  @ApiResponse({ status: 302, description: 'Redirects to the original URL associated with the short URL.' })
  @ApiResponse({ status: 404, description: 'Short URL not found.' })
  @ApiParam({
    name: 'key',
    description: 'The unique key representing the short URL.',
    example: 'v5nXypS',
  })
  @Unprotected()
  async redirect(@Res() res, @Param('key') key: string) {
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
  @ApiOperation({ summary: 'Create Short URL' })
  @ApiResponse({
    status: 201,
    description: 'Short URL created successfully.',
    type: ShortUrl
  })
  @ApiBearerAuth() // 表示此端点需要 Bearer token 认证
  @Roles({ roles: [Role.User] })
  async createShortUrl(@AuthenticatedUser() user: JwtUser, @Body() req: CreateShortUrlReq) {
    return this.service.createShortUrl(req.originalUrl, user.sub);
  }
}
