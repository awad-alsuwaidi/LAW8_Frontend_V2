import { Routes } from "@angular/router";
export const Lookups_Rate_Table_Routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./lookups-rate-table.component').then(c => c.LookupsRateTableComponent),
        children: [
            {
                path: ':rateTableId',
                loadComponent: () => import('./lookups-sub-rate-table/lookups-sub-rate-table.component').then(c => c.LookupsSubRateTableComponent),
            }
        ]
    },
]