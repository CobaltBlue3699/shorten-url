import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppConfigService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let app: TestingModule;
  const HOST = 'www.example.com';
  const PORT = 3000;
  const PROTOCOL = 'http';
  const cnofig = { HOST, PROTOCOL, PORT };
  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
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
  });

  describe('getConfig', () => {
    it('should return "Hello API"', () => {
      const appController = app.get<AppController>(AppController);

      expect(appController.getConfig()).toEqual({
        host: HOST,
        port: PORT,
        protocol: PROTOCOL,
        baseURL: `${PROTOCOL}://${HOST}:${PORT}`,
      });
      // expect(appController.getData()).toEqual({ message: 'Hello API' });
    });
  });
});
