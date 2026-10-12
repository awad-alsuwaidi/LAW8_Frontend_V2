import { Routes } from "@angular/router";

export const SETTINGS_ROUTES:Routes = [
    {
        path: '',
        loadComponent: () => import('./settings.component').then(m => m.SettingsComponent),
        children:[
            {
                path:'general',
                loadComponent: () => import('./settings-general/settings-general.component').then(m => m.SettingsGeneralComponent)
            },
            {
                path:'system-currency',
                loadComponent: () => import('./settings-system-currency/settings-system-currency.component').then(m => m.SettingsSystemCurrencyComponent)
            },
            {
                path:'taxes',
                loadComponent: () => import('./settings-taxes/settings-taxes.component').then(m => m.SettingsTaxesComponent)
            },
            {
                path:'company-logo',
                loadComponent: () => import('./settings-company-logo-editor/settings-company-logo-editor.component').then(m => m.SettingsCompanyLogoEditorComponent)
            },
            {
                path:'',
                redirectTo: 'general',
                pathMatch: 'full'
            }
        ]
    }
]