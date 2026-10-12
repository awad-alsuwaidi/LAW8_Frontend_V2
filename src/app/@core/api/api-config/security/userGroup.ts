export const User_Group_API = {
  userGroup: {
    get: 'Law_User/GetGroupList',
    create: 'Law_UsrGrp/Create',
    update: 'Law_UsrGrp/Update',
    getById: "AppLookup/GetLaw_RolesByUserIdLookup",
    getGroup: "Law_Role/GetList",
    getRoleUsersList: "Law_Role/GetRoleUsersList",
    getUserToAddToRole:"Law_Role/GetUserTAddToRoleList",
    AddUserToRole:"Law_Role/AddUserToRole",
    delete:"Law_Role/DeleteUserFromRole",
    deletee:"Law_Role/Delete"
  },
};
