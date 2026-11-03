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
    field: 'matterCode',
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
    field: 'description',
    style: { flex: '1 1 auto', minWidth: '200px', textAlign: 'left' },
    sortable: true,
  },
  {
    header: 'timesheet.date',
    field: 'date',
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
    field: 'userId',
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
    field: 'taskCodeId',
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

// ===== للـ Timesheet List page =====
export const Timesheet_Columns = [
  { header: 'timesheet.matter', field: 'matterCode', sortable: true },
  { header: 'timesheet.date', field: 'date', sortable: true },
  { header: 'timesheet.task', field: 'taskCodeName', sortable: true },
  { header: 'timesheet.description', field: 'description', sortable: false },
  { header: 'timesheet.lawyer', field: 'userName', sortable: true },
  { header: 'timesheet.status', field: 'statusName', sortable: false },
  { header: 'timesheet.hold', field: 'holdName', sortable: false },
  { header: 'timesheet.hours', field: 'hours', sortable: true },
];
