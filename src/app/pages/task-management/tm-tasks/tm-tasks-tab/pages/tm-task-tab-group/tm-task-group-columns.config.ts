export const Matter_Task_Group_Columns = [
  {
    header: 'matters.description',
    field: 'taskDescription',
    isLargeText: true,
  },
  {
    header: 'matters.priority',
    field: 'priorityId',
    statusLabel: 'priorityName',
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
    field: 'endDate',
    format: 'd MMM y',
    isDate: true,
    // isSort: true,
  },
  {
    header: 'matters.assignee',
    field: 'assignee',
    label: 'assigneeInitial',
    tooltip: 'assigneeName',
    isColumnNumber: true,
  },

  {
    header: 'matters.status',
    field: 'status',
    statusLabel: 'statusName',
    isCustom: true,
  },
];
