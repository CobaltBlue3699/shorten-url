import { Module } from '@nestjs/common';
import { ShortenUrlController } from './shorten-url.controller';
import { ShortenUrlService } from './shorten-url.service';
import { RandomStrategy, SHORTEN_STRATEGY } from './shorten-strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { ShortUrl, ShortUrlSchema } from './schemas/shorten-url.schema';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ShortUrl.name,
        useFactory: (configService: ConfigService) => {
          const schema = ShortUrlSchema;
          schema.index({ shortUrl: 1, }, { unique: true });
          schema.index({ userId: 1, });
          schema.set('timestamps', true);
          schema.set('expireAfterSeconds', configService.get<number>('SHORT_URL_EXPIRE_SECOND'));
          return schema;
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ShortenUrlController],
  providers: [ShortenUrlService, {
    provide: SHORTEN_STRATEGY,
    useClass: RandomStrategy
  }],
})
export class ShortenUrlModule {}
