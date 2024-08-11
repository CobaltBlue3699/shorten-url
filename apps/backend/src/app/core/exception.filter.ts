import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';

export class ApiException extends Error {
  constructor(public readonly statusCode: number, public readonly message: string) {
    super(message);
  }
}

export class RedisException extends ApiException {
  constructor(public readonly statusCode: number, public readonly message: string) {
    super(statusCode, message);
  }
}

@Catch(ApiException)
export class ApiExceptionsFilter implements ExceptionFilter {
  catch(exception: ApiException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      status: status,
      message: exception.message,
      data: null,
    });
  }
}
