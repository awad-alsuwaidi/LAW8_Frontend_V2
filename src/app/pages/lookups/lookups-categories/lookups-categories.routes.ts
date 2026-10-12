import { Routes } from '@angular/router';

export const Lookups_Categories_Routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lookups-categories.component').then(
        (c) => c.LookupsCategoriesComponent
      ),
    children: [
      {
        path: ':id',
        loadComponent: () =>
          import(
            './lookups-sub-categories/lookups-sub-categories.component'
          ).then((c) => c.LookupsSubCategoriesComponent),
      },
    ],
  },
];