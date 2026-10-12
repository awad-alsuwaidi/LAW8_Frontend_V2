import { Routes } from "@angular/router";
import { BankAccountsComponent } from './bank-accounts.component';

export const Lookups_Bank_Accounts_Routes: Routes = [
    {
        path: '', 
        component: BankAccountsComponent,
        data: { breadcrumb: 'lookups.bankAccounts' },
    }
];