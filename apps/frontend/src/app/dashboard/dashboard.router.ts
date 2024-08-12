import { Route } from '@angular/router';

export const DASHBOARD_ROUTES: Route[] = [
  {
    path: 'shorten-url',
    loadComponent: async () => (await import('../shorten-url/shorten-url.component')).ShortenUrlComponent,
  },
  {
    path: 'my-urls',
    loadComponent: async () => (await import('../my-urls/my-urls.component')).MyUrlsComponent,
  },
  // ...
];
