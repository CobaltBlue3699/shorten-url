import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ShortenUrlService } from './shorten-url.service';
import { IpService } from './../geoip/ip.service';

@Processor('usage-count')
export class UsageCountProcessor {
  constructor(private readonly shortenUrlService: ShortenUrlService, private readonly ipService: IpService) {}

  @Process()
  async handleUpdateUsageCount(job: Job<{ key: string, req }>) {
    const { key, req } = job.data
    await this.shortenUrlService.updateDailyUsageCount(key);
    const code = await this.ipService.getCountryByIp(req.ip);
    await this.shortenUrlService.updateCountryUsageCount(key, code);
  }
}
