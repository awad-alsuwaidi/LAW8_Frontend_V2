export const Users_Columns = [
  {
    header: 'users.code',
    field: 'empNo',
    isSort: true,
  },
  {
    header: 'users.user',
    field: 'name',
    isCustom: true,
  },
  {
    header: 'users.mobiles',
    field: 'phoneNumber',
    field2: 'telNo',
  },
  {
    header: 'users.position',
    field: 'title',
    field2: 'depart',
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
