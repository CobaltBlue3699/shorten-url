import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { catchError } from 'rxjs';

export function httpErrorInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  // Clone the request to add the authentication header.
  const newReq = req.clone();
  return next(newReq).pipe(
    catchError((err) => {
      if (err.status === 401) {
        location.href = '/auth/login';
      }
      throw err;
    })
  );
}
