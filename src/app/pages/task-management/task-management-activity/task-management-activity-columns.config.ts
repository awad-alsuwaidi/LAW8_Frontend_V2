export const Activity_Columns = [
  {
    header: 'matters.code',
    field: 'id',
  },
  {
    header: 'search.matterNumber',
    field: 'mtrNo',
        isSort: true,

  },
  {
    header: 'matters.activityType',
    field: 'law_ActivityType',
        isSort: true,

  },
  {
    header: 'matters.description',
    field: 'description',
    isLargeText: true,
        isSort: true,

    class: 'w-56',
  },
  {
    header: 'matters.user',
    field: 'user',
        isSort: true,

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
