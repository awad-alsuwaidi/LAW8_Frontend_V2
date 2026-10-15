export const Users_Columns = [
  {
    header: 'users.code',
    field: 'code',
    isSort: true,
  },
  {
    header: 'users.user',
    field: 'nameEn',
    isCustom: true,
  },
  {
    header: 'users.mobiles',
    field: 'phoneNumber',
    field2: 'phone',
  },
  {
    header: 'users.position',
    field: 'titleName',
    field2: 'departmentName',
  },
  {
    header: 'users.locked',
    field: 'locked',
    class: 'switch-bg',
    isSwitch: true,
    permission: 'Unlock_Users',
  },
  {
    header: 'users.activation',
    field: 'active',
    isSwitch: true,
    permission: 'Deactivate_Users',
  },
];
