export const Bill_API = {
  bill: {
    get: 'Billing/GetList',
    create: 'Billing/Create',
    update: 'Billing/Update',
    getById: 'Billing/GetById',
    getMatterDetailsById: 'Billing/GetMatterDetailsById',
    printBill: 'Billing/GetBillingPrintReport',
    UnDoBill:'Billing/UnDoBill',
    ReCreate:'Billing/PrintInvoice',
  },
  billing: {
    create: 'PreBilling/Create',
  },
  billFeesList: {
    get: 'Billing/GetMatterFeesList',
  },
  billExpensesList: {
    get: 'Billing/GetMatterExpensesList',
  },
  billInvoiceNumberCheck: {
    get: 'Billing/BillingInvoiceNumberCheck',
  },
  discount: {
    create:'Billing/ApplyDiscount'
  },
trustFunds: {
  // getOrNewRandomReceipt: '/trustfunds/receipt/getOrNewRandomReceipt',
  getOrNewRandomReceipt: 'Payments/CreateRandomReceipt',
  getMatterTrustBalance: 'TrustRecepitEntry/GetMatterBalance',
  createReceipt: 'TrustRecepitEntry/Create',
  getAllocationCodes: 'trustfunds/receipt/create',
  trustToGeneralTransfer:'GeneralTransfer/Create',
}

};
