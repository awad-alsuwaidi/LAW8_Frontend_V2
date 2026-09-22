import { Routes } from '@angular/router';

export const LICENSING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/licensing-list/licensing-list').then((c) => c.LicensingList),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/licensing-detail/licensing-detail').then((c) => c.LicensingDetail),
  },
];
