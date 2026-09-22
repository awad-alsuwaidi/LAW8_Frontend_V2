import { Routes } from '@angular/router';

export const TENANT_ROUTES: Routes = [
  {
    path: 'directory',
    loadComponent: () =>
      import('./pages/directory/tenant-list/tenant-list').then((c) => c.TenantList),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register-wizard/register-wizard').then((c) => c.RegisterWizard),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/tenant-detail/tenant-overview/tenant-overview').then(
        (c) => c.TenantOverview
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/tenant-detail/tenant-edit/tenant-edit').then((c) => c.TenantEdit),
  },
  {
    path: ':id/attachments',
    loadComponent: () =>
      import('./pages/attachments/attachment-list/attachment-list').then(
        (c) => c.AttachmentList
      ),
  },
  {
    path: ':id/attachments/upload',
    redirectTo: ':id/attachments',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'directory',
    pathMatch: 'full',
  },
];
