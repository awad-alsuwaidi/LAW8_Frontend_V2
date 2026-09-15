import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard-main/dashboard-main').then(c => c.DashboardMain)
  }
];
