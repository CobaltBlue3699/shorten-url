import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrlController } from './shorten-url.controller';
import { ShortenUrlService } from './shorten-url.service';
import { Role } from '../core/role.enum';
import { AuthenticatedUser, JwtUser } from '@shorten-url/keycloak-connect';
import { RandomStrategy, SHORTEN_STRATEGY } from './shorten-strategy';
import { HttpService } from '@nestjs/axios';

jest.mock('./shorten-url.service');

const mockHttpService = {
  get: jest.fn(),
  post: jest.fn(),
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
          useClass: RandomStrategy
        },
        {
          provide: ShortenUrlService,
          useValue: mockShortUrlService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
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
      mockShortUrlService.getUserShortUrls.mockResolvedValue(mockUrls);

      const result = await controller.getUserShortUrls(mockUser, 1, 10);

      expect(result).toEqual(mockUrls);
      expect(service.getUserShortUrls).toHaveBeenCalledWith(mockUser.sub);
    });
  });

  // describe('redirect', () => {
  //   it('should redirect to the original URL', async () => {
  //     const res = { redirect: jest.fn() };
  //     const mockUrl = { shortUrl: 'abc1234', originalUrl: 'https://example.com' };
  //     mockShortUrlService.getShortUrl.mockResolvedValue(mockUrl);
  //     mockShortUrlService.updateShortUrl.mockResolvedValue({ ...mockUrl, usageCount: 1 });

  //     await controller.redirect(res, 'abc1234');

  //     expect(service.getShortUrl).toHaveBeenCalledWith('abc1234');
  //     expect(service.updateUsageCount).toHaveBeenCalledWith(mockUrl.shortUrl);
  //     expect(res.redirect).toHaveBeenCalledWith('https://example.com');
  //   });
  // });

  // describe('process', () => {
  //   it('should create a short URL', async () => {
  //     const mockCreatedUrl = { shortUrl: 'abc1234', originalUrl: 'https://example.com' };
  //     mockShortUrlService.createShortUrl.mockResolvedValue(mockCreatedUrl);

  //     const result = await controller.process(mockUser, 'https://example.com');

  //     expect(result).toEqual(mockCreatedUrl);
  //     expect(service.createShortUrl).toHaveBeenCalledWith('https://example.com', mockUser.sub);
  //   });
  // });
});
