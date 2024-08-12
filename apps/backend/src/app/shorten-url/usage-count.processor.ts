import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ShortenUrlService } from './shorten-url.service';

@Processor('usage-count')
export class UsageCountProcessor {
  constructor(private readonly shortenUrlService: ShortenUrlService) {}

  @Process()
  async handleUpdateUsageCount(job: Job<{ key: string, req }>) {
    // TODO: req for data analysis

    await this.shortenUrlService.updateUsageCount(job.data.key);
  }
}
