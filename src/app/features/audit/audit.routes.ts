import { Routes } from '@angular/router';

export const AUDIT_ROUTES: Routes = [
  {
    path: 'logs',
    loadComponent: () => import('./pages/audit-logs/audit-logs/audit-logs').then(c => c.AuditLogs)
  },
  {
    path: '',
    redirectTo: 'logs',
    pathMatch: 'full'
  }
];
