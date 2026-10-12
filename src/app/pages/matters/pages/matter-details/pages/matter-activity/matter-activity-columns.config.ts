export const Matter_Activity_Columns = [
  {
    header: 'matters.code',
    field: 'id',
  },
  {
    header: 'matters.activityType',
    field: 'law_ActivityType',
  },
  {
    header: 'matters.description',
    field: 'description',
    isLargeText: true,
  },
  {
    header: 'matters.user',
    field: 'user',
  },

  {
    header: 'matters.date',
    field: 'startDate',
    format: 'yyyy-MM-dd - h:mm a',
    isDate: true,
    isSort: true,
  },

  {
    header: 'matters.status',
    field: 'law_ActivityStatusId',
    statusLabel: 'law_ActivityStatus',
    isStatus: true,
  },
];
