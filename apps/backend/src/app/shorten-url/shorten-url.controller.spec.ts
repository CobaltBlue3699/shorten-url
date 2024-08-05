import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrlController } from './shorten-url.controller';

describe('ShortenUrlController', () => {
  let controller: ShortenUrlController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortenUrlController],
    }).compile();

    controller = module.get<ShortenUrlController>(ShortenUrlController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
