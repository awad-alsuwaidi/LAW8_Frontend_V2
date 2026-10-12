import { Routes } from "@angular/router";
export const Lookups_Task_Groups_Routes: Routes = [
    {
        path:'',
        loadComponent: () => import('./lookups-task-groups.component').then(comp => comp.LookupsTaskGroupsComponent),

    },
    {
        path: 'view/:id',
        loadComponent: () => import('./lookups-task-groups-editor/lookups-task-groups-editor.component').then(m => m.LookupsTaskGroupsEditorComponent),
        data: { breadcrumb: 'View' },
    },
    {
        path: 'update/:id',
        loadComponent: () => import('./lookups-task-groups-editor/lookups-task-groups-editor.component').then(m => m.LookupsTaskGroupsEditorComponent),
        data: { breadcrumb: 'Update' },
    },
    {
        path: 'add',
        loadComponent: () => import('./lookups-task-groups-editor/lookups-task-groups-editor.component').then(m => m.LookupsTaskGroupsEditorComponent),
        data: { breadcrumb: 'Create New' },
    },
]