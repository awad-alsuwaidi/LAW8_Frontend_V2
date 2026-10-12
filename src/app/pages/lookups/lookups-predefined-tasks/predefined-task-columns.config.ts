export const Predefined_Task_Columns=[
    {
        header:'#',
        field:'id'
    },
    {
        header: 'lookups.tasklistName',
        //header: 'Task list Name',
        field: 'nameEn',
        isSort: true,
        isLargeText: true

    },
    {
        header: 'lookups.priority',
        field: 'priorityId',
        statusLabel: 'priorityName',
                isSort: true,

        isStatus: true,
    },
    {
        header: 'lookups.duration',
        field: 'duration',
                isSort: true,

    },
    {
        header: 'lookups.assignee',
        field: 'assignee',
        label:'assigneeInitial',
        tooltip:'assigneeName',
                isSort: true,

        isColumnNumber:true
    },
    
    {
        header: 'lookups.attachment',
        field: 'attachmentCount',
                isSort: true,

        // statusLabel: 'statusName',
        isCustom: true,
    },
]