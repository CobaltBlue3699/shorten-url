import { Body, Controller, DefaultValuePipe, Delete, Get, Inject, Param, ParseIntPipe, Post, Query, Req, Res } from '@nestjs/common';
import { ShortenUrlService } from './shorten-url.service';
import { AuthenticatedUser, JwtUser, Roles, Unprotected } from '@shorten-url/keycloak-connect';
import { Role } from '../core/role.enum';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, PickType } from '@nestjs/swagger';
import { ShortUrl } from './schemas/shorten-url.schema';
import { ApiGlobalResponse, ApiGlobalPaginationResponse } from '../core/response.decorator';
import { UserIP } from '../core/user-ip.decorator';

export class CreateShortUrlReq extends PickType(ShortUrl, ['originalUrl'] as const) {}
@ApiTags('Shorten URLs')
@Controller()
export class ShortenUrlController {
  constructor(
    @Inject() private service: ShortenUrlService,
    @InjectQueue('usage-count') private usageCountQueue: Queue,
    @InjectQueue('del-stat') private delStatQueue: Queue
  ) {}

  @Get('/urls')
  @ApiGlobalPaginationResponse('Get authenticated User His Short URLs.', ShortUrl)
  @ApiBearerAuth() // means api need Bearer token
  @Roles({ roles: [Role.User] })
  async getUserShortUrls(
    @AuthenticatedUser() user: JwtUser,
    @Query('pageNo', new DefaultValuePipe(1), ParseIntPipe) pageNo: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.service.getUserShortUrls(user.sub, pageNo, pageSize);
  }

  @Get('/urls/:key')
  @ApiGlobalResponse('Get Short URL Details of the specified short URL.', ShortUrl)
  @ApiParam({
    name: 'key',
    description: 'The unique key representing the short URL.',
    example: 'v5nXypS',
  })
  @ApiBearerAuth()
  @Roles({ roles: [Role.User] })
  async getShortUrlDetails(
    @AuthenticatedUser() user: JwtUser,
    @Param('key') key: string,
  ) {
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
  async redirect(@Req() req, @Res() res, @UserIP() ip: string, @Param('key') key: string) {
    const shortUrl = await this.service.getShortUrl(key);
    if (shortUrl) {
      const requestInfo = {
        ip,
        url: req.url,
        headers: req.headers,
        // Add any other needed properties here
      };
      await this.usageCountQueue.add({ key, req: requestInfo }, {
        removeOnComplete: true,
        removeOnFail: true
      });
      res.redirect(shortUrl.originalUrl);
    } else { // TODO: 404 page
      res.status(404).redirect(`/#/${key}`);
    }
  }

  @Post('/urls')
  @ApiGlobalResponse('Create Short URL.', ShortUrl)
  @ApiBearerAuth()
  @Roles({ roles: [Role.User] })
  async createShortUrl(@AuthenticatedUser() user: JwtUser, @Body() req: CreateShortUrlReq) {
    return this.service.createShortUrl(req.originalUrl, user.sub);
  }

  @Delete('/urls/:key')
  @ApiGlobalResponse('Delete Short URL.', ShortUrl)
  @ApiBearerAuth()
  @Roles({ roles: [Role.User] })
  async deleteShortUrl(@AuthenticatedUser() user: JwtUser, @Param('key') key: string) {
    const data = await this.service.deleteShortUrl(key, user.sub);
    if (data) {
      this.delStatQueue.add({ key }, {
        removeOnComplete: true,
        removeOnFail: true
      })
    }
    return data;
  }
}
