export const HEARING_SESSION_Columns = [
    {
        header: 'matters.code',
        field: 'id',
    },
      {
        header: 'search.matterNumber',
        field: 'mtrNo',
    },
    {
        header: 'search.courtNumber',
        field: 'courtNumber',
    },
  
    {
        header: 'matters.description',
        field: 'description',
        isLargeText: true,
        class:'w-56	'

    },
    {
        header: 'matters.user',
        field: 'user',
    },

    {
        header: 'matters.date',
        field: 'startDate',
        // format:'d MMM y',
        format:'yyyy-MM-dd',
        isDate: true,
        isSort: true,
    },

    {
        header: 'matters.status',
        field: 'law_ActivityStatusId',
        statusLabel: 'law_ActivityStatus',
        isStatus: true,
    },
]