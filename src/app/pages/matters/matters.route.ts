import { Routes } from "@angular/router";
import { API_Config } from "src/app/@core/api/api-config/api.config";
import { DataResolverService } from "src/app/@shared/resolvers/data-resolver.service";

export const mattersRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('../../@shared/components/bussiness/shared-matter/shared-matter.component').then(comp => comp.SharedMatterComponent),
        resolve: { data: DataResolverService },
        data: { endpoint: API_Config.matters }
    },
   

    {
        path: 'favourite',
        loadComponent: () => import('../../@shared/components/bussiness/shared-matter/shared-matter.component').then(comp => comp.SharedMatterComponent),
        resolve: { data: DataResolverService },
        data: { endpoint: API_Config.importantMatterDashboard }
    },

]