import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ShortenUrlService } from './shorten-url.service';

@Processor('usage-count')
export class UsageCountProcessor {
  constructor(private readonly shortenUrlService: ShortenUrlService) {}

  @Process()
  async handleUpdateUsageCount(job: Job<{ shortUrl: string }>) {
    // Automatically remove job on completion
    job.opts.removeOnComplete = true;
    // Automatically remove job on failure
    job.opts.removeOnFail = true;
    await this.shortenUrlService.updateUsageCount(job.data.shortUrl);
  }
}
