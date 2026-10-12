export const Activity_Columns = [
    {
        header: 'search.code',
        field: 'id',
    },
    {
        header: 'search.activityType',
        field: 'law_ActivityType',
    },
    {
        header: 'search.description',
        field: 'description',
        isLargeText: true

    },
    {
        header: 'search.user',
        field: 'user',
    },

    {
        header: 'search.date',
        field: 'startDate',
        format:'d MMM y - h:mm a',
        isDate: true,
        isSort: true,
    },
]