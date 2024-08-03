import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: `login`,
    // lazy loading
    loadComponent: async () => {
      const m = await import(`./login/login.component`);
      return m.LoginComponent;
    },
  },
  {
    path: ``,
    loadComponent: async () => {
      const m = await import(`./nx-welcome.component`);
      return m.NxWelcomeComponent;
    },
  },
  {
    path: `**`,
    loadComponent: async () => {
      const m = await import('@shorten-url/base');
      return m.PageNotFoundComponent;
    },
  },
];
