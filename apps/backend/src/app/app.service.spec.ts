import { Test } from '@nestjs/testing';

import { AppConfigService } from './app.service';
import { ConfigService } from '@nestjs/config';

describe('AppService', () => {
  let service: AppConfigService;
  const HOST = 'www.example.com';
  const PORT = 3000;
  const PROTOCOL = 'http';
  const cnofig = { HOST, PROTOCOL, PORT };
  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [
        AppConfigService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              return cnofig[key];
            }),
          },
        },
      ],
    }).compile();

    service = app.get<AppConfigService>(AppConfigService);
  });

  describe('getHost', () => {
    it(`should return "${HOST}"`, () => {
      expect(service.getHost()).toEqual(HOST);
    });
  });
});
