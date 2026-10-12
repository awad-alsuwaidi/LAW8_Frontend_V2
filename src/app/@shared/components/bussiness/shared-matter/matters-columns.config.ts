export const Matter_Columns = [
  {
    field: 'mtrNo',
    header: 'matters.matter',
    class: '!w-auto',
    isCustom: true,
  },
  {
    field: 'law_PractsArea',
    field2: 'courtNumber',
    header: 'matters.practiceArea',
    isPracticeArea: true,
  },
  {
    field: 'law_MtrCat',
    field2: 'mtrType',
    header: 'matters.category',
  },
  {
    field: 'law_Client',
    header: 'matters.client',
    isClient: true, 
  },
];
