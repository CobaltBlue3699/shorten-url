import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrlService } from './shorten-url.service';
import { getModelToken } from '@nestjs/mongoose';
import { ShortUrl } from './schemas/shorten-url.schema';
import { HttpService } from '@nestjs/axios';
import { RandomStrategy, SHORTEN_STRATEGY } from './shorten-strategy';

const mockShortUrl = {
  _id: 'someId',
  originalUrl: 'https://example.com',
  shortUrl: 'abc1234',
  userId: 'userId123',
  usageCount: 0,
  title: 'Example Title',
  description: 'Example Description',
  image: 'example.jpg',
};

const mockShortUrlModel = {
  findOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockShortUrl),
  }),
  create: jest.fn().mockResolvedValue(mockShortUrl),
  findOneAndUpdate: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({ ...mockShortUrl, title: 'Updated Title' }),
  }),
  findOneAndDelete: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockShortUrl),
  }),
  find: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([mockShortUrl]),
  }),
};

describe('ShortenUrlService', () => {
  let service: ShortenUrlService;
  let model: typeof mockShortUrlModel;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SHORTEN_STRATEGY,
          useClass: RandomStrategy,
        },
        ShortenUrlService,
        {
          provide: getModelToken(ShortUrl.name),
          useValue: mockShortUrlModel,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<ShortenUrlService>(ShortenUrlService);
    model = module.get(getModelToken(ShortUrl.name));
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createShortUrl', () => {
    it('should create a short URL', async () => {
      jest.spyOn(service, 'fetchUrlPreview').mockResolvedValue({
        title: 'Example Title',
        description: 'Example Description',
        image: 'example.jpg',
      });
      jest.spyOn(service, 'generatorShortUrl').mockResolvedValue('abc1234');

      const result = await service.createShortUrl(mockShortUrl.originalUrl, mockShortUrl.userId);

      expect(result).toEqual(mockShortUrl);
      expect(service.fetchUrlPreview).toHaveBeenCalledWith(mockShortUrl.originalUrl);
      expect(service.generatorShortUrl).toHaveBeenCalledWith(mockShortUrl.originalUrl);
      expect(model.create).toHaveBeenCalledWith(expect.objectContaining({
        originalUrl: mockShortUrl.originalUrl,
        shortUrl: 'abc1234',
        userId: mockShortUrl.userId,
        title: 'Example Title',
        description: 'Example Description',
        image: 'example.jpg',
      }));
    });
  });

  describe('getShortUrl', () => {
    it('should return a short URL', async () => {
      const result = await service.getShortUrl(mockShortUrl.shortUrl);

      expect(result).toEqual(mockShortUrl);
    });
  });

  describe('updateShortUrl', () => {
    it('should update a short URL', async () => {
      const updatedShortUrl = { ...mockShortUrl, title: 'Updated Title' };

      const result = await service.updateShortUrl(mockShortUrl.shortUrl, { title: 'Updated Title' });

      expect(result).toEqual(updatedShortUrl);
    });
  });

  describe('deleteShortUrl', () => {
    it('should delete a short URL', async () => {
      const result = await service.deleteShortUrl(mockShortUrl.shortUrl);

      expect(result).toEqual(mockShortUrl);
    });
  });

  describe('getUserShortUrls', () => {
    it('should return user short URLs', async () => {
      const result = await service.getUserShortUrls(mockShortUrl.userId);

      expect(result).toEqual([mockShortUrl]);
    });
  });
});
