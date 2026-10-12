import { Routes } from '@angular/router';

export const TENANT_ROUTES: Routes = [
  {
    path: 'directory',
    loadComponent: () => import('./pages/directory/tenant-list/tenant-list').then(c => c.TenantList)
  },
  {
    path: '',
    redirectTo: 'directory',
    pathMatch: 'full'
  }
];
