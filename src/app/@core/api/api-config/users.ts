// export const Users_API = {
//     users: {
//       get: 'Law_User/GetList',
//       getById: 'Law_User/GetById',
//       create: 'Law_User/Create',
//       update: 'Law_User/Update',
//       editTimeSheetDate:'Law_User/UsersEditTimeSheetDate',
//       activeUser:'Law_User/UserActivation',
//       lockedUser:'Law_User/UserLocked'
//     }
// }

export const Users_API = {
  users: {
    get: 'tenant/users',
    getById: 'tenant/users',                   
    create: 'tenant/users',                   
    update: 'tenant/users',                    
    resetPassword: 'tenant/users',             
    toggleLock: 'tenant/users',                 
    toggleActive: 'tenant/users',   
    editTimeSheetDate:'tenant/users/timesheet-date',         
  },
};