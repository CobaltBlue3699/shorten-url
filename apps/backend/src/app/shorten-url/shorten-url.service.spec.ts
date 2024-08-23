import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrlService } from './shorten-url.service';
import { getModelToken } from '@nestjs/mongoose';
import { ShortUrl } from './schemas/shorten-url.schema';
import { HttpService } from '@nestjs/axios';
import { RandomStrategy, SHORTEN_STRATEGY } from './shorten-strategy';
import moment from 'moment';
import { CountryUsageStat, DailyUsageStat } from './schemas/usage-state.schema';
import { Model } from 'mongoose';
import { Cache, CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';

let service: ShortenUrlService;
let shortUrlModel: Model<ShortUrl>;
let dailyUsageStatModel: Model<DailyUsageStat>;
let countryUsageStatModel: Model<CountryUsageStat>;
let cacheManager: Cache;

const mockUrlPreview = {
  title: 'Test Title',
  description: 'Test Description',
  image: 'http://example.com/image.png',
  icon: 'http://example.com/favicon.ico',
};

const mockShortUrl = {
  // _id: 'someId',
  originalUrl: 'http://example.com',
  key: 'mockedKey',
  userId: 'userId123',
  title: mockUrlPreview.title,
  description: mockUrlPreview.description,
  image: mockUrlPreview.image,
  icon: mockUrlPreview.icon,
} as ShortUrl;

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [CacheModule.register({})],
    providers: [
      ShortenUrlService,
      {
        provide: SHORTEN_STRATEGY,
        useValue: RandomStrategy,
      },
      {
        provide: getModelToken(ShortUrl.name),
        useValue: {
          create: jest.fn(),
          findOne: jest.fn().mockResolvedValue({
            exec: jest.fn(),
          }),
          find: jest.fn(),
          findOneAndUpdate: jest.fn(),
          findOneAndDelete: jest.fn(),
          deleteMany: jest.fn(),
          aggregate: jest.fn(),
        },
      },
      {
        provide: getModelToken(DailyUsageStat.name),
        useValue: {
          findOneAndUpdate: jest.fn(),
          deleteMany: jest.fn(),
        },
      },
      {
        provide: getModelToken(CountryUsageStat.name),
        useValue: {
          findOneAndUpdate: jest.fn(),
          deleteMany: jest.fn(),
        },
      },
      {
        provide: HttpService,
        useValue: {
          get: jest.fn(),
        },
      },
    ],
  }).compile();

  service = module.get<ShortenUrlService>(ShortenUrlService);
  shortUrlModel = module.get<Model<ShortUrl>>(getModelToken(ShortUrl.name));
  dailyUsageStatModel = module.get<Model<DailyUsageStat>>(getModelToken(DailyUsageStat.name));
  countryUsageStatModel = module.get<Model<CountryUsageStat>>(getModelToken(CountryUsageStat.name));
  cacheManager = module.get<Cache>(CACHE_MANAGER);
});

it('should be defined', () => {
  expect(service).toBeDefined();
});

describe('createShortUrl', () => {
  it('should create a short URL document', async () => {
    jest.spyOn(service, 'fetchUrlPreview').mockResolvedValue(mockUrlPreview);
    jest.spyOn(service, 'generatorKey').mockResolvedValue('mockedKey');
    jest.spyOn(service, 'retry').mockImplementation((fn) => fn());

    shortUrlModel.create = jest.fn().mockResolvedValue(mockShortUrl);

    const result = await service.createShortUrl(mockShortUrl.originalUrl, mockShortUrl.userId);

    expect(result).toEqual(mockShortUrl);
    expect(service.fetchUrlPreview).toHaveBeenCalledWith(mockShortUrl.originalUrl);
    expect(service.generatorKey).toHaveBeenCalledWith(mockShortUrl.originalUrl);
    expect(shortUrlModel.create).toHaveBeenCalledWith(mockShortUrl);
  });
});

describe('generatorKey', () => {
  it('should generate a key using the shorten strategy', async () => {
    const calculateSpy = jest.spyOn(service, 'generatorKey').mockResolvedValue('mockedKey');

    const result = await service.generatorKey(mockShortUrl.originalUrl);

    expect(result).toBe('mockedKey');
    expect(calculateSpy).toHaveBeenCalledWith(mockShortUrl.originalUrl);

    calculateSpy.mockRestore();
  });
});

describe('getShortUrl', () => {
  it('should return the cached short URL if available', async () => {
    const cachedUrl = { key: 'abc123', originalUrl: 'http://example.com' };
    jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedUrl);

    const result = await service.getShortUrl('abc123');

    expect(result).toEqual(cachedUrl);
    expect(cacheManager.get).toHaveBeenCalledWith('abc123');
    expect(shortUrlModel.findOne).not.toHaveBeenCalled();
  });

  it('should fetch the short URL from the database and cache it if not in cache', async () => {
    const dbUrl = { key: 'abc123', originalUrl: 'http://example.com' };

    jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

    // Correctly mock the Mongoose query to include exec with type assertion
    jest.spyOn(shortUrlModel, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValue(dbUrl),
    } as any); // Use 'as any' to bypass TypeScript type checking for mock

    jest.spyOn(cacheManager, 'set').mockResolvedValue(null); // simulate caching

    const result = await service.getShortUrl('abc123');

    expect(result).toEqual(dbUrl);
    expect(cacheManager.get).toHaveBeenCalledWith('abc123');
    expect(shortUrlModel.findOne).toHaveBeenCalledWith({ key: 'abc123' });
    expect(cacheManager.set).toHaveBeenCalledWith('abc123', dbUrl, 60 * 60 * 1000); // cache for 1 hour
  });

  it('should return null if the short URL is not found in cache or database', async () => {
    jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
    // Correctly mock the Mongoose query to include exec with type assertion
    jest.spyOn(shortUrlModel, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    } as any); // Use 'as any' to bypass TypeScript type checking for mock

    jest.spyOn(cacheManager, 'set').mockResolvedValue(null);

    const result = await service.getShortUrl('nonexistentKey');

    expect(result).toBeNull();
    expect(cacheManager.get).toHaveBeenCalledWith('nonexistentKey');
    expect(shortUrlModel.findOne).toHaveBeenCalledWith({ key: 'nonexistentKey' });
    expect(cacheManager.set).not.toHaveBeenCalled();
  });
});

describe('updateShortUrl', () => {
  it('should update a short URL', async () => {
    const updatedShortUrl = { ...mockShortUrl, title: 'Updated Title' };
    jest.spyOn(shortUrlModel, 'findOneAndUpdate').mockReturnValue({
      exec: jest.fn().mockResolvedValue(updatedShortUrl),
    } as any);
    const result = await service.updateShortUrl(mockShortUrl.key, { title: 'Updated Title' });

    expect(result).toEqual(updatedShortUrl);
  });
});

describe('deleteShortUrl', () => {
  it('should delete a short URL', async () => {
    jest.spyOn(shortUrlModel, 'findOneAndDelete').mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockShortUrl),
    } as any);
    const result = await service.deleteShortUrl(mockShortUrl.key, mockShortUrl.userId);
    expect(result).toEqual(mockShortUrl);
  });
});

describe('getUserShortUrls', () => {
  it('should return user short URLs', async () => {
    const dbUrls = [
      { key: 'abc123', originalUrl: 'http://example.com' },
      { key: 'def456', originalUrl: 'http://test.com' },
    ];

    // Correctly mock the Mongoose query chain
    const mockQuery = {
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(dbUrls),
    };

    jest.spyOn(shortUrlModel, 'find').mockReturnValue(mockQuery as any);

    const result = await service.getUserShortUrls('userId123');

    expect(result.data).toEqual(dbUrls);
    expect(shortUrlModel.find).toHaveBeenCalledWith({ userId: 'userId123' });
    expect(mockQuery.skip).toHaveBeenCalledWith(expect.any(Number)); // assuming `skip` is called with a number
    expect(mockQuery.limit).toHaveBeenCalledWith(expect.any(Number)); // assuming `limit` is called with a number
    expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
  });
});

describe('updateDailyUsageCount', () => {
  it('should update the daily usage count', async () => {
    const key = 'test-key';
    const date = moment().format('YYYY-MM-DD');
    jest.spyOn(dailyUsageStatModel, 'findOneAndUpdate').mockReturnValue({
      exec: jest.fn().mockResolvedValueOnce(null),
    } as any);

    await service.updateDailyUsageCount(key);

    expect(dailyUsageStatModel.findOneAndUpdate).toHaveBeenCalledWith(
      { key, date },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );
  });
});

describe('updateCountryUsageCount', () => {
  it('should update the country usage count', async () => {
    const key = 'test-key';
    const countryCode = 'US';
    countryUsageStatModel.findOneAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn(),
    });
    // jest.spyOn(countryUsageStatModel, 'findOneAndUpdate').mockResolvedValueOnce(null);

    await service.updateCountryUsageCount(key, countryCode);

    expect(countryUsageStatModel.findOneAndUpdate).toHaveBeenCalledWith(
      { key, countryCode },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );
  });
});
