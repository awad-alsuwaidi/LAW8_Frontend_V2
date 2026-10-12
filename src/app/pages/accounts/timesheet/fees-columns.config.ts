export const Timesheet_Columns = [
  {
    header: 'timesheet.matter_number',
    field: 'mtrNo',
    isSort: true,
  },
  {
    header: 'timesheet.date',
    field: 'tmDate',
    isSort: true,
    isDate: true,
  },
  {
    header: 'billing.description',
    field: 'explanationExplanation',
    isLargeText: true,
    class: 'w-120',
    isSort: true,
  },
  {
    header: 'timesheet.lawyer',
    field: 'law_Lawer',
    isSort: true,
  },
  {
    header: 'billing.value',
    field: 'amount',
    isNumber: true,
    class: 'w-50 textAlign-left',
    isSort: true,
  },
];
