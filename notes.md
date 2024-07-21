## kill process on windows
- netstat -ano | findstr :{{port}}
- taskkill /PID {{PID}} /F

## development
use `docker-compose watch` to develop this project, it will start keycloak and postgres.
not nestjs and angular, cuz there is a bug in connecting docker and nx in the debug mode of vscode.
see https://github.com/nrwl/nx/issues/14126

