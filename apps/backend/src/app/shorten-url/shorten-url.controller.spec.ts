import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrlController } from './shorten-url.controller';
import { ShortenUrlService } from './shorten-url.service';
import { JwtUser } from '@shorten-url/keycloak-connect';
import { RandomStrategy, SHORTEN_STRATEGY } from './shorten-strategy';
import { HttpService } from '@nestjs/axios';
import { getQueueToken } from '@nestjs/bull';

jest.mock('./shorten-url.service');

const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(),
};

// Ref: https://stackoverflow.com/a/68253049/10779988
export const mockBullQueue = {
  add: jest.fn(),
  process: jest.fn(),
};

describe('ShortenUrlController', () => {
  let controller: ShortenUrlController;
  let service: ShortenUrlService;

  const mockShortUrlService = {
    getUserShortUrls: jest.fn(),
    getShortUrl: jest.fn(),
    updateShortUrl: jest.fn(),
    createShortUrl: jest.fn(),
    updateUsageCount: jest.fn(),
  };

  const mockUser: JwtUser = {
    exp: 0,
    // issued at
    iat: 0,
    // same as iat
    auth_time: 0,
    // JWT ID
    jti: 'userId123',
    // issuer
    iss: 'string',
    // audience
    aud: 'string',
    // subject
    sub: 'userId123',
    // token type
    typ: 'string',
    scope: 'string',
    // Authorized party
    azp: 'string',
    email_verified: true,
    name: 'string',
    preferred_username: 'string',
    given_name: 'string',
    family_name: 'string',
    email: 'string',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortenUrlController],
      providers: [
        {
          provide: SHORTEN_STRATEGY,
          useClass: RandomStrategy,
        },
        {
          provide: ShortenUrlService,
          useValue: mockShortUrlService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: getQueueToken('usage-count'),
          useValue: mockBullQueue,
        },
        {
          provide: getQueueToken('del-stat'),
          useValue: mockBullQueue,
        },
      ],
    }).compile();

    controller = module.get<ShortenUrlController>(ShortenUrlController);
    service = module.get<ShortenUrlService>(ShortenUrlService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserShortUrls', () => {
    it('should return user short URLs', async () => {
      const mockUrls = [{ shortUrl: 'abc1234', originalUrl: 'https://example.com' }];
      mockShortUrlService.getUserShortUrls.mockResolvedValue({
        pageNo: 1,
        pageSize: 10,
        data: mockUrls,
      });

      const result = await controller.getUserShortUrls(mockUser, 1, 10);

      expect(result.data).toEqual(mockUrls);
      expect(service.getUserShortUrls).toHaveBeenCalledWith(mockUser.sub, 1, 10);
    });
  });
});
