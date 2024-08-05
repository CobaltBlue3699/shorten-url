import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrlService } from './shorten-url.service';

describe('ShortenUrlService', () => {
  let service: ShortenUrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShortenUrlService],
    }).compile();

    service = module.get<ShortenUrlService>(ShortenUrlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
