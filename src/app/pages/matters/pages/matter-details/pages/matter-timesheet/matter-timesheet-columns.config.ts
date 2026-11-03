
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
