import { Routes } from '@angular/router';

export const SUBSCRIPTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/subscription-list/subscription-list').then(c => c.SubscriptionList)
  },
  {
    path: 'offboarding',
    loadComponent: () => import('./pages/offboarding-list/offboarding-list').then(c => c.OffboardingList)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/subscription-detail/subscription-detail').then(c => c.SubscriptionDetail)
  },
];
