import { Routes } from '@angular/router';

export const LOOKUPS_MATTERS_LIST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lookups-matters-list.component').then(
        (c) => c.LookupsMattersListComponent,
      ),
    children: [
      {
        path: '7',
        loadComponent: () =>
          import('./lookups-billing-task-tabs/lookups-billing-task-tabs.component').then(
            (c) => c.LookupsBillingTaskTabsComponent,
          ),
      },
      {
        path: '13',
        loadComponent: () =>
          import('./lookups-billing-task-tabs/lookups-billing-task-tabs.component').then(
            (c) => c.LookupsBillingTaskTabsComponent,
          ),
      },

      {
        path: ':subMatterListId',
        loadComponent: () =>
          import('./lookups-sub-matter-list/lookups-sub-matter-list.component').then(
            (c) => c.LookupsSubMatterListComponent,
          ),
      },
    ],
  },
];
