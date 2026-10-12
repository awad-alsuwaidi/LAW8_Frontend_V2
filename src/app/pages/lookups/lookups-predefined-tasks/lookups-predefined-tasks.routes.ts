import { Routes } from "@angular/router";

export const Lookups_Predefined_Tasks_Routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./lookups-predefined-tasks.component').then(
        (comp) => comp.LookupsPredefinedTasksComponent
      ),
    data: { breadcrumb: 'lookups.pREDEFINED_TASKS' },
  },
  {
    path: 'view/:id',
    loadComponent: () =>
      import('./lookups-predefined-tasks-editor/lookups-predefined-tasks-editor.component').then(
        (m) => m.LookupsPredefinedTasksEditorComponent
      ),
    data: { breadcrumb: 'lookups.vIEW_PREDEFINED_TASK' },
  },
  {
    path: 'update/:id',
    loadComponent: () =>
      import('./lookups-predefined-tasks-editor/lookups-predefined-tasks-editor.component').then(
        (m) => m.LookupsPredefinedTasksEditorComponent
      ),
    data: { breadcrumb: 'lookups.uPDATE_PREDEFINED_TASK' },
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./lookups-predefined-tasks-editor/lookups-predefined-tasks-editor.component').then(
        (m) => m.LookupsPredefinedTasksEditorComponent
      ),
    data: { breadcrumb: 'lookups.cREATE_PREDEFINED_TASK' },
  },
];
