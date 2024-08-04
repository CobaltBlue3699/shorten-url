import { Route } from '@angular/router';


export const appRoutes: Route[] = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then((mod) => mod.DashboardComponent),
    data: {
      // showHeader: false,
      showSidebar: false,
      showFooter: false,
    },
  },
  {
    path: ``,
    pathMatch: 'full',
    redirectTo: '/dashboard'
  },
  { path: '**', redirectTo: '' },
];
