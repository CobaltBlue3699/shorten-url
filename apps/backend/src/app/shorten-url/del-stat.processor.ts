import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ShortenUrlService } from './shorten-url.service';

@Processor('del-stat')
export class DeleteStatProcessor {
  constructor(private readonly shortenUrlService: ShortenUrlService) {}

  @Process()
  async handle(job: Job<{ key: string }>) {
    await this.shortenUrlService.deleteShortUrlStat(job.data.key);
    // console.log(`success delete:`, deleteResult);
  }
}
