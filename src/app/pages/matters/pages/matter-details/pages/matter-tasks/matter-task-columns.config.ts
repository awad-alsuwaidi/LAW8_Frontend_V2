// export const Matter_Task_Columns = [
//   {
//     header: 'matters.taskTitle',
//     field: 'title',
//     isSort: true,
//   },
//   {
//     header: 'matters.description',
//     field: 'description',
//     isLargeText: true,
//   },
//   {
//     header: 'matters.priority',
//     field: 'priorityId',
//     statusLabel: 'priorityName',
//     isStatus: true,
//   },
//   {
//     header: 'matters.startDate',
//     field: 'startDate',
//     format: 'yyyy-MM-dd',
//     isSort: true,
//     isDate: true,
//   },
//   {
//     header: 'matters.dueDate',
//     field: 'dueDate',
//     format: 'yyyy-MM-dd',
//     isDate: true,
//   },
//   {
//     header: 'matters.assignee',
//     field: 'assignedUserIds',
//     label: 'assigneeInitial',
//     tooltip: 'assigneeName',
//     isColumnNumber: true,
//   },
//   {
//     header: 'matters.status',
//     field: 'matterTaskStatusId',
//     statusLabel: 'statusName',
//     isCustom: true,
//   },
// ];

export const Matter_Task_Columns = [
  {
    header: 'matters.taskTitle',
    field: 'title',
    isSort: true,
  },
  {
    header: 'matters.description',
    field: 'description',
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
    format: 'yyyy-MM-dd',
    isSort: true,
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
    field: 'assignees',
    label: 'initial',
    tooltip: 'name',
    isColumnNumber: true,
  },
  {
    header: 'matters.status',
    field: 'matterTaskStatusId',
    statusLabel: 'matterTaskStatusName',
    isCustom: true,
    isclickable:true
  },
];
