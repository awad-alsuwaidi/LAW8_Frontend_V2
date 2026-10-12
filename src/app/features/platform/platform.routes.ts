import { Routes } from '@angular/router';

export const PLATFORM_ROUTES: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./pages/users/user-list/user-list').then(c => c.UserList)
  },
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  }
];
