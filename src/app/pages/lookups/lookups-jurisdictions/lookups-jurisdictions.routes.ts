import { Routes } from "@angular/router";
export const Lookups_Jurisdictions_Routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./lookups-jurisdictions.component').then(c => c.LookupsJurisdictionsComponent),
        children: [
            {
                path: ':jurisdictionId',
                loadComponent: () => import('./lookups-sup-jurisdictions/lookups-sup-jurisdictions.component').then(c => c.LookupsSupJurisdictionsComponent),
            }
        ]
    },
]