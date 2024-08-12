import {
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid'

// TODO: statue != 0 時，toast錯誤訊息
export function apiInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {

  // Clone the request to add the X-Requested-With header
  const newReq = req.clone({
    setHeaders: {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Request-ID': uuidv4(),
    },
  });

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
