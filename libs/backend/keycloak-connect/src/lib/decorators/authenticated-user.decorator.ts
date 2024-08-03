import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { extractRequest } from '../util';

export type JwtUser = {
  // expiration time
  exp: number;
  // issued at
  iat: number;
  // same as iat
  auth_time: number;
  // JWT ID
  jti: string;
  // issuer
  iss: string;
  // audience
  aud: string;
  // subject
  sub: string;
  // token type
  typ: string;
  scope: string;
  // Authorized party
  azp: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
};

/**
 * Retrieves the current Keycloak logged-in user.
 * @since 1.5.0
 */
export const AuthenticatedUser = createParamDecorator((data: unknown, ctx: ExecutionContext): JwtUser => {
  const [req] = extractRequest(ctx);
  return req.user;
});
