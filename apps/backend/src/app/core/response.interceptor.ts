import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BYPASS_RESPONSE_FORMAT } from './core.module';
import { ApiStatus } from './api-status.enum';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    const bypass = this.reflector.getAllAndOverride<boolean>(
      BYPASS_RESPONSE_FORMAT,
      [context.getHandler(), context.getClass()],
    );

    if (bypass) {
      return next.handle(); // Skip formatting
    }

    return next.handle().pipe(
      map((data) => ({
        status: ApiStatus.SUCCESS, // Custom success status
        message: 'Success', // You can customize this based on your needs
        data,
      })),
    );
  }
}
