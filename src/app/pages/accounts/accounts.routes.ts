import { Routes } from '@angular/router';

export const accountsRoutes: Routes = [
  {
    path: 'expenses',
    loadComponent: () =>
      import('./expenses/expenses.component').then(
        (comp) => comp.ExpensesComponent
      ),
  },
  {
    path: 'payments-list',
    loadComponent: () =>
      import('./payments-list/payments-list.component').then(
        (comp) => comp.PaymentsListComponent
      ),
  },
  {
    path: 'expenses/add',
    loadComponent: () =>
      import('./expenses/expenses-editor/expenses-editor.component').then(
        (comp) => comp.ExpensesEditorComponent
      ),
  },
  {
    path: 'expenses/update/:expensesIdentifier',
    loadComponent: () =>
      import('./expenses/expenses-editor/expenses-editor.component').then(
        (comp) => comp.ExpensesEditorComponent
      ),
  },
  {
    path: 'recieve-payment',
    loadComponent: () =>
      import('./recieve-payment-editor/recieve-payment-editor.component').then(
        (comp) => comp.RecievePaymentEditorComponent
      ),
  }, 
   {
    path: 'trust-receipt',
    loadComponent: () =>
      import('./trust-receipt/trust-receipt-editor.component').then(
        (comp) => comp.TrustReceiptEditorComponent
      ),
  },
     {
    path: 'trust-to-general',
    loadComponent: () =>
      import('./trust-to-general/trust-to-general.component').then(
        (comp) => comp.TrustToGeneralComponent
      ),
  },
  // {
  //   path: 'addfees',
  //   loadComponent: () =>
  //     import('./timesheet/fees-editor/components/fees-editor/fees-editor.component').then(
  //       (comp) => comp.FeesEditorComponent
  //     ),
  // },
  //   {
  //   path: 'feeslist',
  //   loadComponent: () =>
  //     import('./timesheet/fees.component').then(
  //       (comp) => comp.FeesComponent
  //     ),
  // },
  {
    path: 'fees',
    loadComponent: () =>
      import('./fees/fees.component').then(
        (comp) => comp.FeesComponent
      ),
  },
  {
    path: 'fees/add',
    loadComponent: () =>
      import('./fees/fees-editor/fees-editor.component').then(
        (comp) => comp.FeesEditorComponent
      ),
  },
  {
    path: 'fees/update/:feesIdentifier',
    loadComponent: () =>
      import('./fees/fees-editor/fees-editor.component').then(
        (comp) => comp.FeesEditorComponent
      ),
  },
];
