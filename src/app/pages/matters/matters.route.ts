import { Routes } from '@angular/router';
import { API_Config } from 'src/app/@core/api/api-config/api.config';

export const mattersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../@shared/components/bussiness/shared-matter/shared-matter.component').then(
        (comp) => comp.SharedMatterComponent,
      ),
    data: { endpoint: API_Config.matters },
  },

  {
    path: 'favourite',
    loadComponent: () =>
      import('../../@shared/components/bussiness/shared-matter/shared-matter.component').then(
        (comp) => comp.SharedMatterComponent,
      ),
    data: { endpoint: API_Config.matters },
  },
];
