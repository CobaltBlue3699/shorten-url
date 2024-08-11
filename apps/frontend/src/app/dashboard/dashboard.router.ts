import { Route } from '@angular/router';

export const DASHBOARD_ROUTES: Route[] = [
  {
    path: 'shorten-url',
    loadComponent: async () => (await import('../shorten-url/shorten-url.component')).ShortenUrlComponent,
  },
  {
    path: 'my-url',
    loadComponent: async () => (await import('../my-url/my-url.component')).MyUrlComponent,
  },
  // ...
];
