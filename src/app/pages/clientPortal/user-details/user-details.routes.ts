import { Routes } from '@angular/router';
import { AuthGuard } from 'src/app/@core/guards/auth.guard';
import { permissionGuard } from 'src/app/@core/guards/permission.guard';

export const USER_DETAILS_ROUTES: Routes = [
  {
    path: 'view/:userIdentifier',
    loadComponent: () =>
      import('./user-details.component').then((c) => c.UserDetailsComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./user-info-editor/user-info-editor.component').then(
            (c) => c.UserInfoEditorComponent
          ),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import(
            '../user-details/client-portal-clients/client-portal-clients.component'
          ).then((c) => c.ClientPortalClientsComponent),
        
        canActivate: [AuthGuard, permissionGuard],
        data: { permission: 'Update_TaskManagement' },
      },
      {
        path: 'matters',
        loadComponent: () =>
          import(
            '../user-details/client-portal-matters/client-portal-matters.component'
          ).then((c) => c.ClientPortalMattersComponent),
        canActivate: [AuthGuard, permissionGuard],
        data: { permission: 'Update_TaskManagement' },
      },
    ],
  },
];
