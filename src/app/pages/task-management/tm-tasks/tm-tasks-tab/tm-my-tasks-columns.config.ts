export const Matter_My_Task_Columns = [
  {
    header: 'search.matterNumber',
    field: 'mtrNo',
  },
  {
    header: 'matters.description',
    field: 'description',
    isLargeText: true,
    class: 'w-56	',
  },
  {
    header: 'matters.priority',
    field: 'periority',
    statusLabel: 'periorityName',
    isStatus: true,
  },
  {
    header: 'matters.startDate',
    field: 'startDate',
    format: 'd MMM y',
    isDate: true,
    // isSort: true,
  },
  {
    header: 'matters.dueDate',
    field: 'dueDate',
    format: 'd MMM y',
    isDate: true,
    // isSort: true,
  },
  {
    header: 'matters.assignee',
    field: 'assignees',
    label: 'initial',
    tooltip: 'name',
    isColumnNumber: true,
  },
  {
    header: 'CreatedBy',
    field: 'createdBy',
  },
  {
    header: 'matters.status',
    field: 'status',
    statusLabel: 'statusName',
    isCustom: true,
  },
];
