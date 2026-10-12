export const Notifications_Columns = [
    {
        header: 'Type',
        field: 'type',
        isCustom: true,
            isSort: true,

    },
    {
        header: 'Activity',
        field: 'message',
        isLargeText: true,
            isSort: true,

    },
       {
        header: 'By',
        field: 'byUser',
            isSort: true,

    },
    {
        header: 'Date & Time',
        field: 'actionDate',
        isDate:true,
        format:'d MMM y - h:mm a',
            isSort: true,

    },
]