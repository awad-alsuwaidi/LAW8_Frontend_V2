// export const Timesheet_Columns = [
//   {
//     header: '#',
//     field: 'serial',
//     isCustom: true,
//   },
//   {
//     header: 'timesheet.matter_number',
//     field: 'mtrNo',
//     isSort: true,
//   },
//   {
//     header: 'timesheet.date',
//     field: 'tmDate',
//     isSort: true,
//     isDate: true,
//   },
//   {
//     header: 'timesheet.task',
//     field: 'law_TaskCode',
//     isSort: true,
//     isCustom: true,
//   },
//   {
//     header: 'timesheet.explanation',
//     field: 'explanationExplanation',
//     // isLargeText: true,
//     isSort: true,
//   },
//   // {
//   //   header: 'timesheet.lawyer',
//   //   field: 'law_Lawer',
//   //   isSort: true,
//   // },
//   {
//     header: 'timesheet.lawyer',
//     field: 'law_Lawer',
//     isSort: true,
//     isInitial: true,
//   },

//   {
//     header: 'billing.invoiceNumber',
//     field: 'invoiceNo',
//     isSort: true,
//   },
//   {
//     header: 'timesheet.rate',
//     field: 'rate',
//     isSort: true,
//     requiredPermission: 'View_Rate&Amount',
//   },
//   {
//     header: 'timesheet.hours',
//     field: 'hours',
//     isSort: true,
//     isHour: true,
//     isNumber: true,
//     class: 'text-left-important',
//   },
//   {
//     header: 'timesheet.total',
//     field: 'amount',
//     isNumber: true,
//     requiredPermission: 'View_Rate&Amount',
//     isSort: true,
//     // class: 'text-left-important',
//   },
//   {
//     header: 'timesheet.hold',
//     field: 'holdName',
//     isSort: true,
//   },
// ];

export const Timesheet_Columns = [
  {
    header: '#',
    field: 'serial',
    isCustom: true,
  },
  {
    header: 'timesheet.matter_number',
    field: 'matterCode',
    isSort: true,
  },
  {
    header: 'timesheet.date',
    field: 'date',
    isSort: true,
    isDate: true,
  },
  {
    header: 'timesheet.task',
    field: 'taskCodeName',
    isSort: true,
    isCustom: true,
  },
  {
    header: 'timesheet.explanation',
    field: 'description',
    isSort: true,
  },
  {
    header: 'timesheet.lawyer',
    field: 'userName', 
    isSort: true,
    isCustom: true, 
  },
  {
    header: 'billing.invoiceNumber',
    field: 'invoiceNo',
    isSort: true,
  },
  // {
  //   header: 'timesheet.status',
  //   field: 'statusName',
  //   isSort: true,
  //   isCustom: true,
  // },
  {
    header: 'timesheet.rate',
    field: 'rateAmount',
    isSort: true,
    // requiredPermission: 'View_Rate&Amount',
  },
  {
    header: 'timesheet.hours',
    field: 'hours',
    isSort: true,
    isHour: true,
    isNumber: true,
    class: 'text-left-important',
  },
  {
    header: 'timesheet.total',
    field: 'amount',
    isNumber: true,
    // requiredPermission: 'View_Rate&Amount',
    isSort: true,
  },
  {
    header: 'timesheet.hold',
    field: 'holdName',
    isSort: true,
    isCustom: true,
  },
];
