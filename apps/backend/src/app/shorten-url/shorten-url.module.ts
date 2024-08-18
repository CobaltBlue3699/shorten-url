import { Module } from '@nestjs/common';
import { ShortenUrlController } from './shorten-url.controller';
import { ShortenUrlService } from './shorten-url.service';
import { RandomStrategy, SHORTEN_STRATEGY } from './shorten-strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { ShortUrl, ShortUrlSchema } from './schemas/shorten-url.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CountryUsageSchema, CountryUsageStat, DailyUsageStat, DailyUsageStatSchema } from './schemas/usage-state.schema';
import { BullModule } from '@nestjs/bull';
import { UsageCountProcessor } from './usage-count.processor';
import { DeleteStatProcessor } from './del-stat.processor';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        imports: [ConfigModule],
        name: ShortUrl.name,
        useFactory: (configService: ConfigService) => {
          const schema = ShortUrlSchema;
          schema.index({ key: 1 }, { unique: true });
          schema.index({ userId: 1 });
          schema.set('timestamps', true);
          schema.set('expireAfterSeconds', configService.get<number>('SHORT_URL_EXPIRE_SECOND'));
          return schema;
        },
        inject: [ConfigService],
      },
      // 為何分開schema ?
      // 因為需要時常update url的連結使用次數，分開可提升query效率
      {
        imports: [ConfigModule],
        name: DailyUsageStat.name,
        useFactory: (configService: ConfigService) => {
          const schema = DailyUsageStatSchema;
          schema.index({ key: 1, date: 1 }, { unique: true });
          schema.set('timestamps', true);
          schema.set('expireAfterSeconds', configService.get<number>('SHORT_URL_EXPIRE_SECOND'));
          return schema;
        },
        inject: [ConfigService],
      },
      {
        imports: [ConfigModule],
        name: CountryUsageStat.name,
        useFactory: (configService: ConfigService) => {
          const schema = CountryUsageSchema;
          schema.index({ key: 1, countryCode: 1 }, { unique: true });
          schema.set('timestamps', true);
          schema.set('expireAfterSeconds', configService.get<number>('SHORT_URL_EXPIRE_SECOND'));
          return schema;
        },
        inject: [ConfigService],
      },
    ]),
    BullModule.registerQueue({
      name: 'usage-count',
    }),
    BullModule.registerQueue({
      name: 'del-stat',
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
    DeleteStatProcessor
  ],
})
export class ShortenUrlModule {}
