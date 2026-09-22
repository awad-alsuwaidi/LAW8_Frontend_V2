import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./layout/admin-layout/admin-layout').then((c) => c.AdminLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'setup',
        loadChildren: () =>
          import('./features/setup/setup.routes').then((m) => m.SETUP_ROUTES),
      },
      {
        path: 'tenants',
        loadChildren: () =>
          import('./features/tenant/tenant.routes').then((m) => m.TENANT_ROUTES),
      },
      {
        path: 'subscriptions',
        loadChildren: () =>
          import('./features/subscriptions/subscriptions.routes').then(
            (m) => m.SUBSCRIPTIONS_ROUTES
          ),
      },
      {
        path: 'audit',
        loadChildren: () =>
          import('./features/audit/audit.routes').then((m) => m.AUDIT_ROUTES),
      },
      {
        path: 'licensing',
        loadChildren: () =>
          import('./features/licensing/licensing.routes').then((m) => m.LICENSING_ROUTES),
      },
      {
        path: 'platform',
        loadChildren: () =>
          import('./features/platform/platform.routes').then((m) => m.PLATFORM_ROUTES),
      },
      {
        path: 'self-service',
        loadChildren: () =>
          import('./features/self-service/self-service.routes').then(
            (m) => m.SELF_SERVICE_ROUTES
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
];
