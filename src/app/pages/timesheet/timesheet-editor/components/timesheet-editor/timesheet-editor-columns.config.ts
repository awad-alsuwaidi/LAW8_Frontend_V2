export const timesheetEditorColumnsConfig = [
  {
    header: 'timesheet.timer',
    style: {
      width: '120px',
      minWidth: '120px',
      maxWidth: '120px',
      textAlign: 'left',
    },
    sortable: false,
  },
  {
    header: 'timesheet.matter',
    field: 'mtrNo',
    style: {
      width: '150px',
      minWidth: '150px',
      maxWidth: '150px',
      textAlign: 'left',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    sortable: true,
  },

  {
    header: 'timesheet.explanation',
    field: 'explanationExplanation',

    style: { flex: '1 1 auto', minWidth: '200px', textAlign: 'left' },
    sortable: true,
  },
  {
    header: 'timesheet.endDate',
    field: 'tmDate',
    style: {
      width: '150px',
      minWidth: '150px',
      maxWidth: '150px',
      textAlign: 'left',
    },
    sortable: true,
  },
  {
    header: 'timesheet.lawyer',
    field: 'law_LawerId',
    style: {
      width: '150px',
      minWidth: '150px',
      maxWidth: '150px',
      textAlign: 'left',
    },
    sortable: true,
  },
  {
    header: 'timesheet.task',
    field: 'law_TaskCodeId',
    style: {
      width: '150px',
      minWidth: '150px',
      maxWidth: '150px',
      textAlign: 'left',
    },
    sortable: true,
  },
  {
    header: 'timesheet.hours',
    field: 'hours',
    style: {
      width: '80px',
      minWidth: '80px',
      maxWidth: '80px',
      textAlign: 'left',
    },
    sortable: true,
  },
];

// export const timesheettabelColumnsConfig = [
//   {
//     header: 'timesheet.matter',
//     field: 'mtrNo',
//     sortable: true,
//   },

//   {
//     header: 'timesheet.explanation',
//     field: 'explanationExplanation',
//     isLargeText: true,
//     class: 'w-60',
//     sortable: true,
//   },
//   {
//     header: 'timesheet.endDate',
//     field: 'tmDate',

//     sortable: true,
//   },
//   {
//     header: 'timesheet.lawyer',
//     field: 'law_Lawer',
//     sortable: true,
//   },
//   {
//     header: 'timesheet.task',
//     field: 'law_TaskCode',

//     sortable: true,
//   },
//   {
//     header: 'timesheet.hours',
//     field: 'hours',

//     sortable: true,
//   },
//   {
//     header: 'timesheet.clientName',
//     field: 'clientName',

//     sortable: true,
//   },
//   {
//     header: 'timesheet.notes',
//     field: 'notes',

//     sortable: true,
//   },
//   {
//     header: 'timesheet.rate',
//     field: 'rate',
//     sortable: true,
//   },
//   {
//     header: 'timesheet.amount',
//     field: 'amount',
//     sortable: true,
//   },
// ];
