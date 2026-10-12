import { Routes } from '@angular/router';
import { AuthGuard } from 'src/app/@core/guards/auth.guard';
import { permissionGuard } from 'src/app/@core/guards/permission.guard';

export const Matter_Editor_Routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './pages/matter-details-editor/matter-details-editor.component'
      ).then((comp) => comp.MatterDetailsEditorComponent),
  },
  {
    path: 'parties',
    loadComponent: () =>
      import('../matter-party/matter-party.component').then(
        (comp) => comp.MatterPartyComponent
      ),
    canActivate: [AuthGuard, permissionGuard],
    data: { permission: 'Add_Matter' },
  },
  {
    path: 'contacts',
    loadComponent: () =>
      import(
        '../../../../@shared/components/bussiness/shared-contact/shared-contact.component'
      ).then((m) => m.SharedContactComponent),
    canActivate: [AuthGuard, permissionGuard],
    data: {
      permission: 'Add_Matter',
    },
  },
  {
    path: 'applicant',
    loadComponent: () =>
      import('../matter-applicant/matter-applicant.component').then(
        (comp) => comp.MatterApplicantComponent
      ),
    canActivate: [AuthGuard, permissionGuard],
    data: { permission: 'Add_Matter' },
  },
  {
    path: 'class',
    loadComponent: () =>
      import('../matter-class/matter-class.component').then(
        (comp) => comp.MatterClassComponent
      ),
    canActivate: [AuthGuard, permissionGuard],
    data: { permission: 'Add_Matter' },
  },
  {
    path: 'billing',
    loadComponent: () =>
      import('../matter-billing-editor/matter-billing-editor.component').then(
        (comp) => comp.MatterBillingEditorComponent
      ),
    canActivate: [AuthGuard, permissionGuard],
  },
];
