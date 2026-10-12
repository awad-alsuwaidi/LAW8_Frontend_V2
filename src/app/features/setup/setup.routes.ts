import { Routes } from '@angular/router';

export const SETUP_ROUTES: Routes = [
  {
    path: 'regions',
    loadComponent: () => import('./pages/regions/region-list/region-list').then(c => c.RegionList)
  },
  {
    path: '',
    redirectTo: 'regions',
    pathMatch: 'full'
  }
];
