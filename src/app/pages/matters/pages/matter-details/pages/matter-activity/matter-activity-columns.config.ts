export const Matter_Activity_Columns = [
  { header: 'matters.code', field: 'id' },
  { header: 'matters.activityType', field: 'activityTypeName' },
  { header: 'matters.description', field: 'description', isLargeText: true },
  { header: 'matters.user', field: 'createdByName' },
  {
    header: 'matters.date',
    field: 'startDate',
    format: 'yyyy-MM-dd - h:mm a',
    isDate: true,
    isSort: true,
  },
  {
    header: 'matters.status',
    field: 'activityStatusId',
    statusLabel: 'activityStatusName',
    isStatus: true,
  },
];
