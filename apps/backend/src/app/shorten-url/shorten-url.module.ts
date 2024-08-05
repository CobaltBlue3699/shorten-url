import { Module } from '@nestjs/common';
import { ShortenUrlController } from './shorten-url.controller';
import { ShortenUrlService } from './shorten-url.service';

@Module({
  controllers: [ShortenUrlController],
  providers: [ShortenUrlService],
})
export class ShortenUrlModule {}
