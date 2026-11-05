
// export const Matter_Invoice_Columns = [
//   { header: 'Invoice No.', field: 'invoice' },
//   { header: 'matters.lawyer', field: 'lawyer' },
//   { header: 'matters.aRDate', field: 'date' },
//   { header: 'matters.fees', field: 'fees' },
//   { header: 'Fees Tax', field: 'taxes' },
//   { header: 'Disbs', field: 'disbs' },
//   { header: 'Disbs Tax', field: 'tax' },
//   { header: 'Paid', field: 'paid' },
//   { header: 'Billied', field: 'billied' },
//   // { header: 'matters.paidAmount', field: 'paidAmount' },
//   { header: 'matters.balance', field: 'balance' },
// ];


export const Matter_Invoice_Columns = [
  { header: 'Invoice No.', field: 'invoiceNumber' },
  { header: 'matters.lawyer', field: 'responsibleLawyerName' },
  { header: 'matters.aRDate', field: 'invoiceDate' },
  { header: 'matters.fees', field: 'feesSubTotal' },
  { header: 'Fees Tax', field: 'feesTaxAmount' },
  { header: 'Disbs', field: 'expensesSubTotal' },
  { header: 'Disbs Tax', field: 'expensesTaxAmount' },
  { header: 'Paid', field: 'paidAmount' },
  { header: 'Billied', field: 'total' },
  { header: 'matters.balance', field: 'balance' },
];