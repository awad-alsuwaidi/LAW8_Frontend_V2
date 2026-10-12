import { Routes } from '@angular/router';

export const ADVANCED_SEARCH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./advanced-search.component').then(
        (c) => c.AdvancedSearchComponent
      ),
    children: [
      {
        path: ':module/:search',
        loadComponent: () =>
          import(
            './advanced-search-details/advanced-search-details.component'
          ).then((c) => c.AdvancedSearchDetailsComponent),
      },
    ],
  },
];
