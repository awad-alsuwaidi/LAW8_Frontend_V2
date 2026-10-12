export const Bill_Time_Fees_Columns = [
  {
    field: 'tmDate',
    header: 'Date',
    isSort: true,
    isDate: true,
  },
  {
    field: 'initial',
    header: 'Initial',
    isSort: true,
    tooltipField: 'law_Lawer',
  },
  {
    field: 'taskCodeName',
    header: 'Task',
    isSort: true,
    isCustom: true
  },
  {
    field: 'hours',
    header: 'Hours',
    isSort: true,
    isHour: true,
    isNumber: true,
    class: 'text-left-important',
  },
  {
    field: 'rate',
    header: 'Rate',
    isSort: true,
  },
  {
    field: 'amount',
    header: 'Amount',
    isSort: true,
    class: 'amount-col',
  },
  {
    field: 'explanationExplanation',
    header: 'Explanation',
  },
  {
    field: 'holdName',
    header: 'Hold',
  },
];
