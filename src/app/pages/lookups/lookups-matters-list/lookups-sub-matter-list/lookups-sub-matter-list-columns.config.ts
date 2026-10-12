// export const Lookup_Sub_Matter_list_Columns = (groupId: number) => {
//   const columns: any[] = [
//     {
//       header: 'lookups.nameEN',
//       field: 'nameEn',
//       isSort: true,
//     },
//     {
//       header: 'lookups.nameAR',
//       field: 'nameAr',
//       isSort: true,
//     },
//     {
//       header: 'lookups.active',
//       field: groupId === 13 ? 'isActive' : 'active',
//       statusLabel: 'activeText',
//       isStatus: true,
//       isSort: true,
//     },
//   ];

//   if (groupId === 13) {
//     columns.push({
//       header: 'lookups.default',
//       field: 'isDefault',
//       statusLabel: 'defaultText',
//       isStatus: true,
//       isSort: true,
//     });
//   }

//   return columns;
// };

export const Lookup_Sub_Matter_list_Columns = (groupId: number) => {
  if (groupId === 13) {
    return [
      {
        header: 'lookups.name',
        field: 'nameEn',
        isSort: true,
      },
      {
        header: 'lookups.taskCodesCount',
        field: 'activeTaskCodeCount',
        isSort: false,
      },
    ];
  }

  const columns: any[] = [
    { header: 'lookups.nameEN', field: 'nameEn', isSort: true },
    { header: 'lookups.nameAR', field: 'nameAr', isSort: true },
  ];

  if (groupId === 7) {
    columns.push(
      { header: 'lookups.groupName', field: 'taskCodeGroupName', isSort: false },
      { header: 'lookups.initial', field: 'initial', isSort: false },
    );
  }

  columns.push({
    header: 'lookups.active',
    field: 'active',
    statusLabel: 'activeText',
    isStatus: true,
    isSort: true,
  });

  return columns;
};
