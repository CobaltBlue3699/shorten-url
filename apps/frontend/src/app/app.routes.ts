import { Route } from '@angular/router';


export const appRoutes: Route[] = [
  {
    path: 'dashboard',
    pathMatch: 'prefix',
    loadComponent: () => import('./dashboard/dashboard.component').then((mod) => mod.DashboardComponent),
    data: {
      // showHeader: false,
      showSidebar: false,
      showFooter: false,
    },
    loadChildren: () => import('./dashboard/dashboard.router').then(mod => mod.DASHBOARD_ROUTES)
  },
  {
    path: ``,
    pathMatch: 'full',
    redirectTo: '/dashboard/shorten-url'
  },
  { path: '**', redirectTo: '' },
];
