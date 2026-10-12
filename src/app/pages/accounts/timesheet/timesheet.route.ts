import { Routes } from '@angular/router';

export const TIMESHEET_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./fees.component').then((c) => c.FeesComponent),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./fees-editor/components/fees-editor/fees-editor.component').then(
        (c) => c.FeesEditorComponent
      ),
  },
];
