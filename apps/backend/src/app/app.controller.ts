import { Controller, Get, Redirect } from '@nestjs/common';

import { AppService } from './app.service';
import { Role } from '../common/enum/role.enum';
import { Public, RoleMatchingMode, Roles } from '@shorten-url/keycloak-connect';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('/hello')
  hello() {
    return `hello`;
  }

  @Get(`/admin`)
  @Roles({
    roles: [Role.Admin],
    mode: RoleMatchingMode.ANY,
  })
  admin() {
    return `admin`;
  }

  @Get(`/user`)
  @Roles({
    roles: [Role.Admin, Role.User],
    mode: RoleMatchingMode.ANY,
  })
  user() {
    return `user`;
  }
}
