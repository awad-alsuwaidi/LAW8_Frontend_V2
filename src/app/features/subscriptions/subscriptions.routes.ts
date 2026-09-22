import { Routes } from '@angular/router';

export const SUBSCRIPTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/subscription-list/subscription-list').then(c => c.SubscriptionList)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/subscription-detail/subscription-detail').then(c => c.SubscriptionDetail)
  },
];
