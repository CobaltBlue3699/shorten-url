import { Test, TestingModule } from '@nestjs/testing';
import { KeycloakController } from './keycloak.controller';
import { AuthService } from './../services/auth.service';
import { KEYCLOAK_CONNECT_OPTIONS } from '../constants';
import { KeycloakConnectOptions } from '../keycloak-connect.module';
import { JwtUser } from './../decorators/authenticated-user.decorator';

describe('KeycloakController', () => {
  let controller: KeycloakController;
  let authService: AuthService;

  const mockAuthService = {
    codeExchangeToken: jest.fn(),
    logout: jest.fn(),
  };

  const mockKeycloakOptions: KeycloakConnectOptions = {
    authServerUrl: 'http://localhost:8080/auth',
    realm: 'myrealm',
    clientId: 'myclient',
    secret: 'mysecret',
    cookieKey: 'myCookieKey',
    refreshCookieKey: 'myRefreshCookieKey',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeycloakController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: KEYCLOAK_CONNECT_OPTIONS, useValue: mockKeycloakOptions },
      ],
    }).compile();

    controller = module.get<KeycloakController>(KeycloakController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('redirectToLoginPage', () => {
    it('should redirect to home if user is already logged in', () => {
      const req = { query: {}, headers: {}, path: '/auth/login' };
      const res = { redirect: jest.fn() };
      const user: JwtUser = { sub: 'userId123' } as any;

      controller.redirectToLoginPage(req, res, user);

      expect(res.redirect).toHaveBeenCalledWith('/');
    });

    it('should redirect to Keycloak login page if user is not logged in', () => {
      const req = {
        query: {},
        headers: { host: 'localhost:3000' },
        path: '/auth/login',
        protocol: 'http',
      };
      const res = { redirect: jest.fn() };
      const user = null;

      controller.redirectToLoginPage(req, res, user);

      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining('http://localhost:8080/auth/realms/myrealm/protocol/openid-connect/auth'));
    });
  });

  describe('getProfile', () => {
    it('should return the authenticated user profile', () => {
      const user: JwtUser = { sub: 'userId123' } as any;
      const result = controller.getProfile(user);

      expect(result).toEqual(user);
    });
  });

  describe('code', () => {
    it('should exchange the code for tokens and set cookies', async () => {
      const req = {
        headers: { host: 'localhost:3000' },
        protocol: 'http',
        path: '/auth/code',
      };
      const res = {
        cookie: jest.fn(),
        redirect: jest.fn(),
      };
      const code = 'authCode';
      const tokens = {
        access_token: 'accessToken',
        refresh_token: 'refreshToken',
      };

      mockAuthService.codeExchangeToken.mockResolvedValue(tokens);

      await controller.code(req, res, code, '');

      expect(authService.codeExchangeToken).toHaveBeenCalledWith(code, 'http://localhost:3000/auth/code');
      expect(res.cookie).toHaveBeenCalledWith(mockKeycloakOptions.cookieKey, tokens.access_token, expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith(mockKeycloakOptions.refreshCookieKey, tokens.refresh_token, expect.any(Object));
      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('logout', () => {
    it('should clear cookies and logout the user', async () => {
      const req = { refreshTokenJWT: 'refreshToken' };
      const res = {
        clearCookie: jest.fn(),
        json: jest.fn(),
      };

      await controller.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith(mockKeycloakOptions.cookieKey);
      expect(res.clearCookie).toHaveBeenCalledWith(mockKeycloakOptions.refreshCookieKey);
      expect(authService.logout).toHaveBeenCalledWith(req.refreshTokenJWT);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        message: 'logout!',
      });
    });
  });
});
