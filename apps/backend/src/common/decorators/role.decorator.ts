import { SetMetadata } from '@nestjs/common';
import { ROLES } from '../constants/meta.constant';
import { Role } from '../enum/role.enum';

/**
 * example:
 *
 * 1.
 * 		@Roles(Role.user, Role.admin)
 * 		@Controller()
 * 		export class SomeController {
 *				// requests handled by this controller is public to user and admin
 * 		}
 * 2.
 * 		@Controller()
 * 		export class SomeController {
 *				@Roles(Role.admin)
 *				@Get()
 *				public someHandler() {
 *					// admin only
 *				}
 * 		}
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);
