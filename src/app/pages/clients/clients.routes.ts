import { Routes } from "@angular/router";
export const clientsRoutes: Routes = [
    {
        path: 'view/:id',
        loadComponent: () => import('./pages/clients-details/clients-details.component').then(m => m.ClientsDetailsComponent),
        loadChildren: () => import('./pages/clients-details/client-details.routes').then(m => m.ClientDetailsRoutes) 
    },
    {
        path: 'update/:id',
        loadComponent: () => import('./pages/clients-editor/clients-editor.component').then(m => m.ClientsEditorComponent), 
    },
]