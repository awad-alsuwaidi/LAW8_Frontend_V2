import { Routes } from '@angular/router';
import { permissionGuard } from 'src/app/@core/guards/permission.guard';

export const lookupsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lookups.component').then((comp) => comp.LookupsComponent),
    // ★ الرئيسية بدون guard — بتفلتر الكروت بنفسها
  },

  {
    path: 'categories',
    loadChildren: () =>
      import('./lookups-categories/lookups-categories.routes').then(
        (mod) => mod.Lookups_Categories_Routes
      ),
    canActivate: [permissionGuard],
    data: {
      permission: { routeName: 'MatterCategories', action: 'canRead' },
    },
  },

  {
    path: 'matters-list',
    loadChildren: () =>
      import('./lookups-matters-list/lookups-matters-list.routes').then(
        (mod) => mod.LOOKUPS_MATTERS_LIST_ROUTES
      ),
    canActivate: [permissionGuard],
    data: {
      permission: {
        anyOf: [
          { routeName: 'MatterStatuses',     action: 'canRead' },
          { routeName: 'MatterStages',       action: 'canRead' },
          { routeName: 'ReferralTypes',      action: 'canRead' },
          { routeName: 'PartyDescriptions',  action: 'canRead' },
          { routeName: 'AdjournmentReasons', action: 'canRead' },
          { routeName: 'TaskCodes',          action: 'canRead' },
          { routeName: 'TaskCodeGroups',     action: 'canRead' },
          { routeName: 'PracticeAreas',      action: 'canRead' },
          { routeName: 'Departments',        action: 'canRead' },
          { routeName: 'Industries',         action: 'canRead' },
        ],
      },
    },
  },

  {
    path: 'task-groups',
    loadChildren: () =>
      import('./lookups-task-groups/lookups-task-groups.routes').then(
        (mod) => mod.Lookups_Task_Groups_Routes
      ),
    canActivate: [permissionGuard],
    data: {
      permission: { routeName: 'TaskCodes', action: 'canRead' },
      breadcrumb: 'lookups.taskGroups_title',
    },
  },

  {
    path: 'predefined-tasks',
    loadChildren: () =>
      import('./lookups-predefined-tasks/lookups-predefined-tasks.routes').then(
        (mod) => mod.Lookups_Predefined_Tasks_Routes
      ),
    canActivate: [permissionGuard],
    data: {
      permission: { routeName: 'PredefinedTasks', action: 'canRead' },
      breadcrumb: 'lookups.pREDEFINED_TASKS',
    },
  },

  {
    path: 'jurisdictions',
    loadChildren: () =>
      import('./lookups-jurisdictions/lookups-jurisdictions.routes').then(
        (mod) => mod.Lookups_Jurisdictions_Routes
      ),
    canActivate: [permissionGuard],
    data: {
      permission: { routeName: 'Jurisdictions', action: 'canRead' },
    },
  },

  {
    path: 'rate-table',
    loadChildren: () =>
      import('./lookups-rate-table/lookups-rate-table.routes').then(
        (mod) => mod.Lookups_Rate_Table_Routes
      ),
    canActivate: [permissionGuard],
    data: {
      permission: { routeName: 'Rates', action: 'canRead' },
    },
  },

  {
    path: 'bank-accounts',
    loadComponent: () =>
      import('./bank-accounts/bank-accounts.component').then(
        (comp) => comp.BankAccountsComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permission: { routeName: 'BankAccounts', action: 'canRead' },
      breadcrumb: 'lookups.bankAccounts',
    },
  },

  {
    path: 'gl-bank-accounts',
    loadComponent: () =>
      import('./gl-bank-accounts/gl-bank-accounts.component').then(
        (comp) => comp.GlBankAccountsComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permission: { routeName: 'GlAccounts', action: 'canRead' },
      breadcrumb: 'lookups.bankAccounts',
    },
  },
];