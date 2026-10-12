import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
    {
        path: '', loadComponent: () => import('./users.component').then(c => c.UsersComponent),
        loadChildren:()=>import('./user-details/user-details.routes').then(m=>m.USER_DETAILS_ROUTES)
    },
    {
        path:'add',
        loadComponent:()=>import('./user-info-editor/user-info-editor.component').then(c=>c.UserInfoEditorComponent),
    },
    {
        path:'update/:userIdentifier',
        loadComponent:()=>import('./user-info-editor/user-info-editor.component').then(c=>c.UserInfoEditorComponent)
    },
    

]