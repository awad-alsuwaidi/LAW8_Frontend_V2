import { Routes } from '@angular/router';

export const TIMESHEET_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./timesheet.component').then((c) => c.TimesheetComponent),
  },{
    path: 'add',
    loadComponent: () =>
      import(
        './timesheet-editor/components/timesheet-editor/timesheet-editor.component'
      ).then((c) => c.TimesheetEditorComponent),
  },
];



// import { Routes } from '@angular/router';
// import { permissionGuard } from '@core/guards/permission.guard';

// export const TIMESHEET_ROUTES: Routes = [
//   {
//     path: '',
//     canActivateChild: [permissionGuard],
//     data: { permission: 'View_Timesheet' },
//     children: [
//       {
//         path: '',
//         loadComponent: () =>
//           import('./timesheet.component').then((c) => c.TimesheetComponent),
//       },
//       {
//         path: 'add',
//         loadComponent: () =>
//           import(
//             './timesheet-editor/components/timesheet-editor/timesheet-editor.component'
//           ).then((c) => c.TimesheetEditorComponent),
//         data: { permission: 'Add_Timesheet' },
//       },
//     ],
//   },
// ];
