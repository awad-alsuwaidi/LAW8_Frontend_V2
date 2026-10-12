import { Routes } from "@angular/router";

export const TASK_MANAGEMENT_ROUTES: Routes = [
    { path: 'calendar', loadComponent: () => import('./calendar/calendar.component').then(c => c.CalendarComponent) },
    {
        path: 'hearing-session',
        loadComponent: () => import('./task-management-activity/task-management-activity.component').then(c => c.TaskManagementActivityComponent)
    },
    {
        path: 'activity',
        loadComponent: () => import('./task-management-activity/task-management-activity.component').then(c => c.TaskManagementActivityComponent)
    },
    {
        path: 'task',
        loadComponent: () => import('./tm-tasks/tm-tasks.component').then(c => c.TmTasksComponent),
        children: [
            { path: 'my-tasks', loadComponent: () => import('./tm-tasks/tm-tasks-tab/tm-tasks-tab.component').then(com => com.TmTasksTabComponent) },
            { path: 'assignee-tasks', loadComponent: () => import('./tm-tasks/tm-tasks-tab/tm-tasks-tab.component').then(com => com.TmTasksTabComponent) },
            {path:'',redirectTo:'my-tasks',pathMatch:'full'}
        ]
    },
]