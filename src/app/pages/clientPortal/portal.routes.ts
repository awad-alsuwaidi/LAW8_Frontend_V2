import { Routes } from '@angular/router';

export const PORTAL_ROUTES: Routes = [
    {
        path: '', loadComponent: () => import('./client-portal.component').then(c => c.ClientPortalComponent),
        loadChildren:()=>import('./user-details/user-details.routes').then(m=>m.USER_DETAILS_ROUTES)
    },
    

]