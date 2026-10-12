import { Routes } from '@angular/router';

export const USER_DETAILS_ROUTES: Routes = [
    {
        path: 'view/:userIdentifier',
        loadComponent: () => import('./user-details.component').then(c => c.UserDetailsComponent),
        children: [
            {
                path: '',
                loadComponent: () => import('../user-info-editor/user-info-editor.component').then(c => c.UserInfoEditorComponent)
            },
            {
                path: 'rate-table',
                loadComponent: () => import('./user-rate-table/user-rate-table.component').then(c => c.UserRateTableComponent)
            },
        ]
    }

]