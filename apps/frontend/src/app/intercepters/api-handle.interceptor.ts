import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpHandlerFn,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

// TODO: statue != 0 時，toast錯誤訊息
export function apiInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  // Clone the request to add the authentication header.
  const newReq = req.clone();
  return next(newReq).pipe(
    map((event) => {
      if (event instanceof HttpResponse) {
        const body = event.body as any;
        if (body && body.status === 0) {
          return event.clone({ body: body.data });
        }
      }
      return event;
    })
  );
}
