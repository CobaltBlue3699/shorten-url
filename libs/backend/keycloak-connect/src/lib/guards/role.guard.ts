import { CanActivate, ExecutionContext, Inject, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as KeycloakConnect from 'keycloak-connect';
import {
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_INSTANCE,
  RoleMatchingMode,
  RoleMerge,
} from '../constants';
import { META_ROLES } from '../decorators/roles.decorator';
import { KeycloakConnectOptions } from '../interface/keycloak-connect-options.interface';
import { RoleDecoratorOptionsInterface } from '../interface/role-decorator-options.interface';
import { extractRequest } from '../util';
import { KeycloakConnectModule } from '../keycloak-connect.module';

/**
 * A permissive type of role guard. Roles are set via `@Roles` decorator.
 * @since 1.1.0
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    private keycloak: KeycloakConnect.Keycloak,
    @Inject(KEYCLOAK_CONNECT_OPTIONS)
    private keycloakOpts: KeycloakConnectOptions,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roleMerge = this.keycloakOpts.roleMerge ? this.keycloakOpts.roleMerge : RoleMerge.OVERRIDE;

    const rolesMetaDatas: RoleDecoratorOptionsInterface[] = [];

    if (roleMerge == RoleMerge.ALL) {
      const mergedRoleMetaData = this.reflector.getAllAndMerge<RoleDecoratorOptionsInterface[]>(META_ROLES, [
        context.getClass(),
        context.getHandler(),
      ]);

      if (mergedRoleMetaData) {
        rolesMetaDatas.push(...mergedRoleMetaData);
      }
    } else if (roleMerge == RoleMerge.OVERRIDE) {
      const roleMetaData = this.reflector.getAllAndOverride<RoleDecoratorOptionsInterface>(META_ROLES, [
        context.getClass(),
        context.getHandler(),
      ]);

      if (roleMetaData) {
        rolesMetaDatas.push(roleMetaData);
      }
    } else {
      throw Error(`Unknown role merge: ${roleMerge}`);
    }

    const combinedRoles = rolesMetaDatas.flatMap((x) => x.roles);

    if (combinedRoles.length === 0) {
      return true;
    }

    // Use matching mode of first item
    const roleMetaData = rolesMetaDatas[0];
    const roleMatchingMode = roleMetaData.mode ? roleMetaData.mode : RoleMatchingMode.ANY;

    KeycloakConnectModule.logger.verbose(`Using matching mode: ${roleMatchingMode}`);
    KeycloakConnectModule.logger.verbose(`Roles: ${JSON.stringify(combinedRoles)}`);

    // Extract request
    const [request] = extractRequest(context);
    const { accessTokenJWT, refreshTokenJWT } = request;

    // if is not an HTTP request ignore this guard
    if (!request) {
      return true;
    }

    if (!accessTokenJWT) {
      // No access token attached, auth guard should have attached the necessary token
      KeycloakConnectModule.logger.warn(
        'No access token found in request, are you sure AuthGuard is first in the chain?'
      );
      return false;
    }

    const grant = await this.keycloak.grantManager.createGrant({
      access_token: accessTokenJWT,
      refresh_token: refreshTokenJWT,
    });

    // Grab access token from grant
    const accessToken: KeycloakConnect.Token = grant.access_token as any;

    // For verbose logging, we store it instead of returning it immediately
    const granted =
      roleMatchingMode === RoleMatchingMode.ANY
        ? combinedRoles.some((r) => accessToken.hasRole(r))
        : combinedRoles.every((r) => accessToken.hasRole(r));

    if (granted) {
      KeycloakConnectModule.logger.verbose(`Resource granted due to role(s)`);
    } else {
      KeycloakConnectModule.logger.verbose(`Resource denied due to mismatched role(s)`);
    }

    return granted;
  }
}
