import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  provideRouter,
  // withComponentInputBinding,
  withHashLocation,
} from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { httpErrorInterceptor } from './intercepters/http-error.intercepter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      appRoutes,
      // withComponentInputBinding(),
      withHashLocation()
    ),
    provideHttpClient(
      withInterceptors([httpErrorInterceptor]),
      // withInterceptorsFromDi()
    )
  ],
};
