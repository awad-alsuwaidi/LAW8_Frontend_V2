export const Task_Groups_Columns = [
  {
    header: '#',
    field: 'id',
  },
  {
    header: 'lookups.tasklistName',
    field: 'nameEn',
    isSort: true,
    isLargeText: true,
  },
  {
    header: 'lookups.tasks',
    field: 'itemsCount',
    isSort: true,
  },
  {
    header: 'lookups.createDate',
    field: 'createdAtUtc',
    format: 'd MMM y - h:mm a',
    isSort: true,

    isDate: true,
  },
  {
    header: 'lookups.by',
    field: 'createdBy',
    isSort: true,
  },
];
