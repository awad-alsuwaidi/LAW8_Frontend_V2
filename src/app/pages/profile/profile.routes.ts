import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
    { path: '', loadComponent: () => import('./profile.component').then(c => c.ProfileComponent) },
    { path: 'update', loadComponent: () => import('./profile-editor/profile-editor.component').then(c => c.ProfileEditorComponent) },
]