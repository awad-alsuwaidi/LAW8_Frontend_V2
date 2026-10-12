import { Routes } from '@angular/router';

export const SELF_SERVICE_ROUTES: Routes = [
  {
    path: 'my-org',
    loadComponent: () => import('./pages/my-org/my-org').then(c => c.MyOrg)
  },
  {
    path: '',
    redirectTo: 'my-org',
    pathMatch: 'full'
  }
];
