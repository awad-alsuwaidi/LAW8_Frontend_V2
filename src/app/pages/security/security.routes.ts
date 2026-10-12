import { Routes } from "@angular/router";

export const SECURITY_ROUTES: Routes = [
    {
        path: 'users',
        loadComponent: () => import('./security-users/security-users.component').then(comp => comp.SecurityUsersComponent)
    },
    {
        path: 'groups',
        children: [
            { path: '', loadComponent: () => import('./security-groups/security-groups.component').then(comp => comp.SecurityGroupsComponent) },
            { path: 'update/:groupIdentifier', loadComponent: () => import('./security-groups/security-groups-editor/security-groups-editor.component').then(comp => comp.SecurityGroupsEditorComponent) },
            { path: 'add', loadComponent: () => import('./security-groups/security-groups-editor/security-groups-editor.component').then(comp => comp.SecurityGroupsEditorComponent) },
            { path: ':groupIdentifier/assigned-users', loadComponent: () => import('./security-groups/security-groups-assigned-users/security-groups-assigned-users.component').then(comp => comp.SecurityGroupsAssignedUsersComponent) },
        ]

    },
    {
        path: 'calendar',
        loadComponent: () => import('./security-calendar/security-calendar.component').then(comp => comp.SecurityCalendarComponent)
    },
    {
        path: 'timesheet',
        loadComponent: () => import('./security-timesheet/security-timesheet.component').then(comp => comp.SecurityTimesheetComponent)
    },
    {
        path: 'matter',
        loadComponent: () => import('./security-matter/security-matter.component').then(comp => comp.SecurityMatterComponent)
    },
    {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
    }
]