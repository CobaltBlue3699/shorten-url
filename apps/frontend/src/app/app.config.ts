import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withDebugTracing, withHashLocation } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpErrorInterceptor } from './intercepters/http-error.intercepter';
import { apiInterceptor } from './intercepters/api-handle.interceptor';
import { AppInfoService } from './services/app.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      appRoutes,
      // withComponentInputBinding(),
      withHashLocation(),
      withDebugTracing()
    ),
    provideHttpClient(withInterceptors([httpErrorInterceptor, apiInterceptor])),
    AppInfoService,
  ],
};
