import { Routes } from '@angular/router';

export const SETUP_ROUTES: Routes = [
  { path: 'regions',           loadComponent: () => import('./pages/regions/region-list/region-list').then(c => c.RegionList) },
  { path: 'countries',         loadComponent: () => import('./pages/countries/country-list/country-list').then(c => c.CountryList) },
  { path: 'currencies',        loadComponent: () => import('./pages/currencies/currency-list/currency-list').then(c => c.CurrencyList) },
  { path: 'features',          loadComponent: () => import('./pages/features/features-list/features-list').then(c => c.FeaturesList) },
  { path: 'org-types',         loadComponent: () => import('./pages/org-types/org-types-list/org-types-list').then(c => c.OrgTypesList) },
  { path: 'products',          loadComponent: () => import('./pages/products/products-list/products-list').then(c => c.ProductsList) },
  { path: '',                  redirectTo: 'regions', pathMatch: 'full' },
];
