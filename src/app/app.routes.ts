import { Routes } from '@angular/router';
import { AuthGuard } from './@core/guards/auth.guard';
import { PAGES_ROUTES } from './pages/pages.routes';

export const routes: Routes = [
    {
    path: 'invalid-subdomain',
    loadComponent: () =>
      import('./@core/auth/auth/invalid-subdomain/invalid-subdomain.component').then(
        (m) => m.InvalidSubdomainComponent
      ),
  },
    {
    path: 'advanced-search',
    loadChildren: () =>
      import('./pages/advanced-search/advanced-search.routes').then(
        (mod) => mod.ADVANCED_SEARCH_ROUTES
      ),
  },
  // {
  //   path: '',
  //   loadComponent: () =>
  //     import('./layout/layout.component').then((m) => m.LayoutComponent),
  //   loadChildren: () =>
  //     import('./pages/pages.routes').then((mod) => mod.PAGES_ROUTES),
  // },
{
  path: '',
  canActivate: [AuthGuard],
  loadComponent: () =>
    import('./layout/layout.component').then(m => m.LayoutComponent),
  children: PAGES_ROUTES
}
,
  {
    path: 'auth',
    loadComponent: () =>
      import('./@core/auth/auth/auth.component').then((m) => m.AuthComponent),
    loadChildren: () =>
      import('./@core/auth/auth/auth.routes').then((mod) => mod.AUTH_ROUTES),
  },
  {
    path: 'forget-password',
    loadComponent: () =>
      import('./@core/auth/forgetpassword/forgetpassword.component').then(
        (m) => m.ForgetpasswordComponent
      ),
    loadChildren: () =>
      import('./@core/auth/forgetpassword/forgetpassword.routes').then(
        (mod) => mod.FORGET_PASSWORD_ROUTES
      ),
  },

  { path: '', redirectTo: 'auth', pathMatch: 'full' },
];
