export const Task_Management_Columns = [
  {
    header: 'search.code',
    field: 'id',
    isSort: true,
  },
  {
    header: 'search.matterNumber',
    field: 'mtrNo',
    isSort: true,
  },
  {
    header: 'search.courtNumber',
    field: 'courtNumber',
    isSort: true,
  },
  {
    header: 'search.activityType',
    field: 'law_ActivityType',
    isSort: true,
  },
  {
    header: 'search.description',
    field: 'description',
    isSort: true,
    isLargeText: true
  },
  {
    header: 'search.user',
    field: 'user',
    isSort: true,
  },

  {
    header: 'search.date',
    field: 'startDate',
    isDate: true,
    isSort: true,
  },

  {
    header: 'search.status',
    field: 'law_ActivityStatus',
    isSort: true,
    isStatus: true,
  },
];
