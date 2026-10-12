import { Routes } from '@angular/router';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { AuthGuard } from 'src/app/@core/guards/auth.guard';
import { permissionGuard } from 'src/app/@core/guards/permission.guard';
import { DataResolverService } from 'src/app/@shared/resolvers/data-resolver.service';

export const Matter_Details_Routes: Routes = [
    {
    path: '',
    redirectTo: 'details',
    pathMatch: 'full'
  },
  {
    path: 'details',
    loadComponent: () =>
      import('./pages/matter-detail-info/matter-detail-info.component').then(
        (comp) => comp.MatterDetailInfoComponent
      ),
  },
  {
    path: 'parties',
    loadComponent: () =>
      import('../matter-party/matter-party.component').then(
        (comp) => comp.MatterPartyComponent
      ),
    canActivate: [AuthGuard, permissionGuard],
    data: { permission: 'View_Matter_Parties' },
  },
  {
    path: 'attachments',
    loadComponent: () =>
      import('./pages/matter-attachment/matter-attachment.component').then(
        (comp) => comp.MatterAttachmentComponent
      ),
    canActivate: [AuthGuard, permissionGuard],
    data: { permission: 'Add_Matter_Documents' },
  },
  {
    path: 'contacts',
    loadComponent: () =>
      import(
        '../../../../@shared/components/bussiness/shared-contact/shared-contact.component'
      ).then((m) => m.SharedContactComponent),
    resolve: { data: DataResolverService },
    canActivate: [AuthGuard, permissionGuard],
    data: {
      endpoint: API_Config.matterContact,
      idKey: 'matterId',
      addPermission: 'Add_Matter_Contacts',
      editPermission: 'Update_Matter_Contacts',
      deletePermission: 'Delete_Matter_Contacts',
      permission: 'View_Matter_Contacts',
    },
  },
  {
    path: 'related-matters',
    loadComponent: () =>
      import(
        '../../../../@shared/components/bussiness/shared-matter/shared-matter.component'
      ).then((comp) => comp.SharedMatterComponent),
    resolve: { data: DataResolverService },
    canActivate: [AuthGuard, permissionGuard],
    data: {
      endpoint: API_Config.matterRelatedMatter,
      idKey: 'matterId',
      permission: 'View_Matter',
    },
  },
  {
    path: 'activities',
    loadComponent: () =>
      import('./pages/matter-activity/matter-activity.component').then(
        (comp) => comp.MatterActivityComponent
      ),
    canActivate: [AuthGuard, permissionGuard],
    data: { permission: 'View_TaskManagement' },
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./pages/matter-tasks/matter-tasks.component').then(
        (comp) => comp.MatterTasksComponent
      ),
    canActivate: [AuthGuard, permissionGuard],
    data: { permission: 'View_TaskManagement' },
  },

  {
    path: 'class',
    loadComponent: () =>
      import('../matter-class/matter-class.component').then(
        (comp) => comp.MatterClassComponent
      ),
    canActivate: [AuthGuard, permissionGuard],
    data: { permission: 'View_Matter_Classes' },
  },
  {
    path: 'applicant',
    loadComponent: () =>
      import('../matter-applicant/matter-applicant.component').then(
        (comp) => comp.MatterApplicantComponent
      ),
    canActivate: [AuthGuard, permissionGuard],
    data: { permission: 'View_Matter_Applicants' },
  },
  {
    path: 'timesheet',
    loadComponent: () =>
      import('./pages/matter-timesheet/matter-timesheet.component').then(
        (comp) => comp.MatterTimesheetComponent
      ),
    canActivate: [AuthGuard, permissionGuard],
    data: { permission: 'View_Matter_Timesheet' },
  },
  {
    path: 'invoice',
    loadComponent: () =>
      import('./pages/matter-invoice/matter-invoice.component').then(
        (comp) => comp.MatterInvoiceComponent
      ),
    canActivate: [AuthGuard, permissionGuard],
    data: { permission: 'View_Matter_Invoices' },
  },
  {
    path: 'billing',
    loadComponent: () =>
      import('../matter-billing-editor/matter-billing-editor.component').then(
        (comp) => comp.MatterBillingEditorComponent
      ),
    canActivate: [AuthGuard, permissionGuard],
    data: { permission: 'View_Matter_Invoices' },
  },
];
