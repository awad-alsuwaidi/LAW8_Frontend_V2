export const Matter_Task_Columns = [
  {
    header: 'matters.description',
    field: 'description',
    isSort:true,
    isLargeText: true,
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
    format: 'yyyy-MM-dd',
    isSort:true,
    isDate: true,
  },
  {
    header: 'matters.dueDate',
    field: 'dueDate',
    format: 'yyyy-MM-dd',
    isDate: true,
  },
  {
    header: 'matters.assignee',
    field: 'assigneeList',
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
