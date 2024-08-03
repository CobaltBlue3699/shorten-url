## kill process on windows
- netstat -ano | findstr :{{port}}
- taskkill /PID {{PID}} /F

## development
use `docker-compose watch` to develop this project, it will start the instances of keycloak and postgres.
not nestjs and angular, cuz there is a bug in connecting docker and nx in the debug mode of vscode.
see https://github.com/nrwl/nx/issues/14126

`docker compose up -d && docker compose logs --follow`

## CI Commands
TODO: write a tool script for this  
- add --dry-run show what will be generated without writing to disk:

`nx generate @nrwl/angular:component button --directory=apps/frontend/src/app/button --style=scss`
`nx generate @nrwl/angular:lib my-button-lib --directory=libs/my-button-lib` 
`nx g @nx/nest:module auth --directory=apps/backend/src/app/auth --language=ts --module=app --dry-run`
`nx g @nx/nest:controller controllerName --directory=apps/backend/src/app/moduleName --module= --language=ts`
`nx g @nx/workspace:remove my-feature-lib --forceRemove`
`nx g @nx/workspace:move --project my-feature-lib --destination shared/my-feature-lib`
`nx g @nx/nest:library keycloak-connect --directory=libs/backend/keycloak-connect --publishable --buildable`

nx g @nrwl/angular:lib base --directory=libs/frontend/base --standalone=false  --dry-run
nx g @nrwl/angular:module base --project=base --dry-run
nx g @nx/nest:module core --directory=apps/backend/src/app/core --dry-run
nx generate @nrwl/angular:component page-not-found --directory=libs/frontend/base/page-not-found --style=scss --dry-run
nx g @nx/nest:controller auth --directory=apps/backend/src/app/auth --module=app --language=ts --dry-run
nx g @nx/nest:service auth --directory=apps/backend/src/app/auth --language=ts --dry-run

nx g @nx/nest:controller keycloak --directory=libs/backend/keycloak-connect/src/lib/controller/ --module=keycloak-connect --dry-run
nx g @nx/nest:filter unauthorized --directory=libs/backend/keycloak-connect/src/lib/filter/ --dry-run
