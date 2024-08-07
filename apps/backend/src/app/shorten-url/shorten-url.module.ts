import { Module } from '@nestjs/common';
import { ShortenUrlController } from './shorten-url.controller';
import { ShortenUrlService } from './shorten-url.service';
import { RandomStrategy, SHORTEN_STRATEGY } from './shorten-strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { ShortUrl, ShortUrlSchema } from './schemas/shorten-url.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsageStat, UsageStatSchema } from './schemas/usage-state.schema';
import { BullModule } from '@nestjs/bull';
import { UsageCountProcessor } from './usage-count.processor';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        imports: [ConfigModule],
        name: ShortUrl.name,
        useFactory: (configService: ConfigService) => {
          const schema = ShortUrlSchema;
          schema.index({ shortUrl: 1 }, { unique: true });
          schema.index({ userId: 1 });
          schema.set('timestamps', true);
          schema.set('expireAfterSeconds', configService.get<number>('SHORT_URL_EXPIRE_SECOND'));
          return schema;
        },
        inject: [ConfigService],
      },
      {
        name: UsageStat.name,
        useFactory: () => UsageStatSchema,
      },
    ]),
    BullModule.registerQueue({
      name: 'usage-count',
    }),
  ],
  controllers: [ShortenUrlController],
  providers: [
    ShortenUrlService,
    {
      provide: SHORTEN_STRATEGY,
      useClass: RandomStrategy,
    },
    UsageCountProcessor,
  ],
})
export class ShortenUrlModule {}
