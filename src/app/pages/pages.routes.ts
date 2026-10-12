import { Routes } from '@angular/router';
import { AuthGuard } from '../@core/guards/auth.guard';
import { API_Config } from '../@core/api/api-config/api.config';
import { DataResolverService } from '../@shared/resolvers/data-resolver.service';

export const PAGES_ROUTES: Routes = [
//   {
//     path: 'dashboard',
//     loadComponent: () =>
//       import('./dashboard/dashboard.component').then(
//         (m) => m.DashboardComponent
//       ),
//   },
//   {
//     path: 'clients',
//     loadComponent: () =>
//       import('./clients/clients.component').then((m) => m.ClientsComponent),
//     loadChildren: () =>
//       import('./clients/clients.routes').then((m) => m.clientsRoutes),
//     data: { permission: 'View_Client', breadcrumb: 'menu.clients.title' },
//   },
//   {
//     path: 'clients/details/:id',
//     loadComponent: () =>
//       import('./clients/pages/clients-details/clients-details.component').then(
//         (m) => m.ClientsDetailsComponent
//       ),
//     loadChildren: () =>
//       import('./clients/pages/clients-details/client-details.routes').then(
//         (m) => m.ClientDetailsRoutes
//       ),
//   },
//   {
//     path: 'clients/inactive',
//     loadComponent: () =>
//       import('./clients/clients.component').then((m) => m.ClientsComponent),
//     loadChildren: () =>
//       import('./clients/clients.routes').then((m) => m.clientsRoutes),
//   },
//   {
//     path: 'clients/add',
//     loadComponent: () =>
//       import('./clients/pages/clients-editor/clients-editor.component').then(
//         (m) => m.ClientsEditorComponent
//       ),
//     data: { permission: 'Add_Client', breadcrumb: 'menu.clients.title' },
//   },
//   {
//     path: 'matters',
//     loadComponent: () =>
//       import('./matters/matters.component').then((m) => m.MattersComponent),
//     loadChildren: () =>
//       import('./matters/matters.route').then((m) => m.mattersRoutes),
//     data: { breadcrumb: 'Matters' },
//   },

//   {
//     path: 'matters/inactive',
//     loadComponent: () =>
//       import(
//         '../@shared/components/bussiness/shared-matter/shared-matter.component'
//       ).then((m) => m.SharedMatterComponent),
//     loadChildren: () =>
//       import('./matters/matters.route').then((m) => m.mattersRoutes),
//     resolve: { data: DataResolverService },
//     data: {
//       endpoint: API_Config.inActiveMatters,
//       title: 'menu.inactiveMatters',
//     },
//   },
//   {
//     path: 'matters/add',
//     loadComponent: () =>
//       import('./matters/pages/matter-editor/matter-editor.component').then(
//         (comp) => comp.MatterEditorComponent
//       ),
//     loadChildren: () =>
//       import('./matters/pages/matter-editor/matter-editor.routes').then(
//         (m) => m.Matter_Editor_Routes
//       ),
//   },
//   {
//     path: 'matters/:id',
//     loadComponent: () =>
//       import('./matters/pages/matter-details/matter-details.component').then(
//         (comp) => comp.MatterDetailsComponent
//       ),
//     loadChildren: () =>
//       import('./matters/pages/matter-details/matter-details.routes').then(
//         (mod) => mod.Matter_Details_Routes
//       ),
//     data: { breadcrumb: 'View' },
//   },
//   {
//     path: 'matters/inactive/:id',
//     loadComponent: () =>
//       import('./matters/pages/matter-details/matter-details.component').then(
//         (comp) => comp.MatterDetailsComponent
//       ),
//     loadChildren: () =>
//       import('./matters/pages/matter-details/matter-details.routes').then(
//         (mod) => mod.Matter_Details_Routes
//       ),
//   },
//   {
//     path: 'matters/edit/:id',
//     loadComponent: () =>
//       import(
//         './matters/pages/matter-editor/pages/matter-details-editor/matter-details-editor.component'
//       ).then((comp) => comp.MatterDetailsEditorComponent),
//   },
//   {
//     path: 'matters/:id/tasks/:taskId',
//     loadComponent: () =>
//       import(
//         './matters/pages/matter-details/pages/matter-tasks/pages/matter-task-group/matter-task-group.component'
//       ).then((comp) => comp.MatterTaskGroupComponent),
//   },
//   {
//     path: 'timesheet',
//     loadChildren: () =>
//       import('./timesheet/timesheet.route').then((mod) => mod.TIMESHEET_ROUTES),
//   },
//   {
//     path: 'lookups',
//     loadChildren: () =>
//       import('./lookups/lookups.route').then((mod) => mod.lookupsRoutes),
//     data: { breadcrumb: 'menu.lookups' },
//   },
//   {
//     path: 'task-management',
//     loadChildren: () =>
//       import('./task-management/task-management.routes').then(
//         (mod) => mod.TASK_MANAGEMENT_ROUTES
//       ),
//   },
//   {
//     path: 'profile',
//     loadChildren: () =>
//       import('./profile/profile.routes').then((mod) => mod.PROFILE_ROUTES),
//   },
//   {
//     path: 'advanced-search',
//     loadChildren: () =>
//       import('./advanced-search/advanced-search.routes').then(
//         (mod) => mod.ADVANCED_SEARCH_ROUTES
//       ),
//   },
//   {
//     path: 'users',
//     loadChildren: () =>
//       import('./users/users.routes').then((mod) => mod.USERS_ROUTES),
//   },
//   {
//     path: 'portal',
//     loadChildren: () =>
//       import('./clientPortal/portal.routes').then((mod) => mod.PORTAL_ROUTES),
//   },
//   {
//     path: 'users/view-list/:userIdentifier',
//     loadComponent: () =>
//       import('./users/user-details/user-details.component').then(
//         (c) => c.UserDetailsComponent
//       ),
//     children: [
//       {
//         path: '',
//         loadComponent: () =>
//           import('./users/user-info-editor/user-info-editor.component').then(
//             (c) => c.UserInfoEditorComponent
//           ),
//       },
//       {
//         path: 'rate-table',
//         loadComponent: () =>
//           import(
//             './users/user-details/user-rate-table/user-rate-table.component'
//           ).then((c) => c.UserRateTableComponent),
//       },
//     ],
//   },
//   {
//     path: 'notification',
//     loadComponent: () =>
//       import('./notification/notification.component').then(
//         (comp) => comp.NotificationComponent
//       ),
//   },
//   {
//     path: 'notifications',
//     loadComponent: () =>
//       import('./notifications/notifications.component').then(
//         (comp) => comp.NotificationsComponent
//       ),
//   },
//   {
//     path: 'reports',
//     loadChildren: () =>
//       import('./reports/reports.routes').then((mod) => mod.REPORTS_ROUTES),
//   },
//   {
//     path: 'settings',
//     loadChildren: () =>
//       import('./settings/settings.routes').then((mod) => mod.SETTINGS_ROUTES),
//   },
//   {
//     path: 'contacts',
//     loadComponent: () =>
//       import('./contacts/contacts.component').then(
//         (comp) => comp.ContactsComponent
//       ),
//   },
//   {
//     path: 'security',
//     loadComponent: () =>
//       import('./security/security.component').then(
//         (comp) => comp.SecurityComponent
//       ),
//     loadChildren: () =>
//       import('./security/security.routes').then((mod) => mod.SECURITY_ROUTES),
//   },
//   {
//     path: 'billing',
//     loadChildren: () =>
//       import('./billing/billing.routes').then((mod) => mod.billingRoutes),
//   },
//   {
//     path: 'accounts',
//     loadChildren: () =>
//       import('./accounts/accounts.routes').then((mod) => mod.accountsRoutes),
//   },
//   {
//   path: '',
//   canActivate: [AuthGuard],
//   loadComponent: () =>
//     import('./dashboard/dashboard.component').then(
//       (m) => m.DashboardComponent
//     ),
// },
  {
    path: 'lookups',
    loadChildren: () =>
      import('./lookups/lookups.route').then((mod) => mod.lookupsRoutes),
    data: { breadcrumb: 'menu.lookups' },
  },
  {
  path: '',
  canActivate: [AuthGuard],
  loadComponent: () =>
    import('./lookups/lookups.component').then(
      (m) => m.LookupsComponent
    ),
},

];
