import { Routes } from '@angular/router';

export const SUBSCRIPTIONS_ROUTES: Routes = [
  {
    path: 'list',
    loadComponent: () => import('./pages/subscription-detail/subscription-detail').then(c => c.SubscriptionDetail)
  },
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  }
];
