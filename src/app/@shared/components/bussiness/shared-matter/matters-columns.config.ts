export const Matter_Columns = [
  {
    field: 'matterCode', 
    header: 'matters.matter',
    class: '!w-auto',
    isCustom: true,
  },
  {
    field: 'practiceAreaName', 
    field2: 'courtNumber',
    header: 'matters.practiceArea',
    isPracticeArea: true,
  },
  {
    field: 'matterCategoryName', 
    field2: 'matterTypeName', 
    header: 'matters.category',
  },
  {
    field: 'clientName', 
    header: 'matters.client',
    isClient: true,
  },
];