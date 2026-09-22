import { Routes } from '@angular/router';

export const PLATFORM_ROUTES: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./pages/users/user-list/user-list').then(c => c.UserList)
  },
  {
    path: 'users/new',
    loadComponent: () => import('./pages/users/user-form/user-form').then(c => c.UserForm)
  },
  {
    path: 'users/:id/edit',
    loadComponent: () => import('./pages/users/user-form/user-form').then(c => c.UserForm)
  },
  {
    path: 'roles',
    loadComponent: () => import('./pages/roles/role-list/role-list').then(c => c.RoleList)
  },
  {
    path: 'permissions/:roleName',
    loadComponent: () => import('./pages/permissions/permission-matrix/permission-matrix').then(c => c.PermissionMatrix)
  },
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  }
];
