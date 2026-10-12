export const Billing_Expenses_Columns = [
  {
    header: 'Date',
    field: 'date',
    isDate: true,
    isSort: true,
  },
  {
    header: 'Paid to / Received from',
    field: 'paidToReceivedFrom',
    isSort: true,
  },
  {
    header: 'Type',
    field: 'typeName',
    isSort: true,
  },
  {
    header: 'Invoice No',
    field: 'invoiceNo',
    isSort: true,
  },

  {
    header: 'Matter',
    field: 'matterNo',
    isSort: true,
  },
  {
    header: 'Amount',
    field: 'amount',
    isSort: true,
    class: 'amount-col',
  },
  {
    header: 'Lawyer',
    field: 'lawyerName',
    isSort: true,
  }, {
    header: 'Hold',
    field: 'holdName',
    isSort: true,
  },
  { field: 'userName', header: 'User' },
{ field: 'check_Receipt', header: 'Check/Receipt' },
{ field: 'quantity', header: 'Quantity' },
{ field: 'price', header: 'Price' },

];
