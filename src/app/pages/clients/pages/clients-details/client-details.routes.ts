import { Routes } from '@angular/router';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { DataResolverService } from 'src/app/@shared/resolvers/data-resolver.service';

export const ClientDetailsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../clients-editor/clients-editor.component').then(
        (m) => m.ClientsEditorComponent
      ),
  },

  {
    path: 'contacts',
    loadComponent: () =>
      import(
        '../../../../@shared/components/bussiness/shared-contact/shared-contact.component'
      ).then((m) => m.SharedContactComponent),
    resolve: { data: DataResolverService },
    data: {
      endpoint: API_Config.clientsContact,
      idKey: 'clientId',
      addPermission: 'Add_ClientContact',
      editPermission: 'Update_ClientContact',
      deletePermission: 'Delete_ClientContact',
    },
  },
  {
    path: 'related-matters',
    loadComponent: () =>
      import(
        '../../../../@shared/components/bussiness/shared-matter/shared-matter.component'
      ).then((comp) => comp.SharedMatterComponent),
    resolve: { data: DataResolverService },
    data: { endpoint: API_Config.matters, idKey: 'clientId' },
  },
];
