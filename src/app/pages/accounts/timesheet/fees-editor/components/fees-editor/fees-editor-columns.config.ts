export const timesheetEditorColumnsConfig = [
  {
    header: 'timesheet.matter',
    field: 'mtrNo',
    style: {
      width: '150px',
      minWidth: '150px',
      maxWidth: '150px',
      textAlign: 'center',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    sortable: true
  },
  {
    header: 'billing.description',
    field: 'explanationExplanation',
    style: {
      flex: '1 1 auto',
      minWidth: '200px',
      textAlign: 'center'
    },
    sortable: true
  },
  {
    header: 'timesheet.lawyer',
    field: 'law_LawerId',
    style: {
      width: '150px',
      minWidth: '150px',
      maxWidth: '150px',
      textAlign: 'center'
    },
    sortable: true
  },
  {
    header: 'timesheet.date',
    field: 'tmDate',
    style: {
      width: '140px',
      minWidth: '140px',
      maxWidth: '140px',
      textAlign: 'center'
    },
    sortable: true
  },
  {
    header: 'billing.value',
    field: 'amount',
    style: {
      width: '120px',
      minWidth: '120px',
      maxWidth: '120px',
      textAlign: 'center'
    },
    sortable: true
  }
];
