
import { Routes } from "@angular/router";

export const billingRoutes: Routes = [
    {
        path: 'bills',
        loadComponent: () => import('./bills/bills.component').then(comp => comp.BillsComponent),
    },
    {
        path: 'bills/add',
        loadComponent: () => import('./bills/bills-editor/bills-editor.component').then(comp => comp.BillsEditorComponent),
    },
    {
        path: 'bills/update/:billIdentifier',
        loadComponent: () => import('./bills/bills-editor/bills-editor.component').then(comp => comp.BillsEditorComponent),
    },
   
    {
        path: 'quick-bill/add',
        loadComponent: () => import('./quick-bill-editor/quick-bill-editor.component').then(comp => comp.QuickBillEditorComponent),
    },
    {
        path: 'pre-bill/add',
        loadComponent: () => import('./pre-bill-editor/pre-bill-editor.component').then(comp => comp.PreBillEditorComponent),
    },
]; 