// export const Matter_Timesheet_Columns = [
//   {
//     header: 'matters.date',
//     field: 'tmDate'
//   },
//   {
//     header: 'matters.explanation',
//     field: 'explanationExplanation',
//   },
//   {
//     header: 'matters.lawyer',
//     field: 'law_Lawer',
//   },
//   {
//     header: 'matters.rate',
//     field: 'rate',
//     requiredPermission:'View_Rate&Amount',
//   },
//   {
//     header: 'matters.hours',
//     field: 'hours',
//   },
//   {
//     header: 'matters.total',
//     field: 'amount',
//     requiredPermission:'View_Rate&Amount',
//   },

//   // {
//   //   header: 'Task',
//   //   field: 'law_TaskCode',
//   // },
//   // {
//   //   header: 'Notes',
//   //   field: 'notes',
//   //   isLargeText:true
//   // },
// ];

export const Matter_Timesheet_Columns = [
  {
    header: 'matters.date',
    field: 'date',
    isSort: true,
  },
  {
    header: 'matters.explanation',
    field: 'description',
    isSort: true,
  },
  {
    header: 'matters.lawyer',

    isSort: true,
    field: 'userName',
  },
  {
    header: 'matters.rate',
    isSort: true,
    field: 'rateAmount',
    requiredPermission: 'View_Rate&Amount',
  },
  {
    header: 'matters.hours',
    isSort: true,
    field: 'hours',
  },
  {
    header: 'matters.total',
    isSort: true,
    field: 'amount',
    requiredPermission: 'View_Rate&Amount',
  },
];
