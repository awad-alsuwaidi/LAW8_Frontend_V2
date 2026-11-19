export const Clients_Columns = [
  {
    header: 'common.name',
    field: 'name',
    isSort: true,
  },
  {
    header: 'common.category',
    field: 'contactCategoryName',
    isSort: true,
  },
  {
    header: 'common.type',
    field: 'ownerType',
    isSort: true,
  },
  {
    // header: 'common.clientNo',  // تعديل كويس
    header: 'common.codeNo',
    field: 'ownerCode',
    isClientNo: true,
    isSort: true,
  },
  {
    header: 'common.phone',
    field: 'phone1',
    isSort: true,
  },
  {
    header: 'common.email',
    field: 'email',
    isSort: true,
  },
];
