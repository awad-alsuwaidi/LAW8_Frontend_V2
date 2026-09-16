import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/guards/auth.guard';


export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
    {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./layout/admin-layout/admin-layout').then(c => c.AdminLayout)
  },
  {
    path: 'setup',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/setup/setup.routes').then(m => m.SETUP_ROUTES)
  },
  {
    path: 'tenants',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/tenant/tenant.routes').then(m => m.TENANT_ROUTES)
  },
  {
    path: 'subscriptions',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/subscriptions/subscriptions.routes').then(m => m.SUBSCRIPTIONS_ROUTES)
  },
  {
    path: 'audit',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/audit/audit.routes').then(m => m.AUDIT_ROUTES)
  },
  {
    path: 'platform',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/platform/platform.routes').then(m => m.PLATFORM_ROUTES)
  },
  {
    path: 'self-service',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/self-service/self-service.routes').then(m => m.SELF_SERVICE_ROUTES)
  },

  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  }
];