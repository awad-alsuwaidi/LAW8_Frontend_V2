export const Group_Secuirty_API = {
  groupSecurity: {
    get:"Law_Role/GetList",
    getPermissions:"Law_Role/GetAllModuleItemsDetails",
    create:"Law_Role/CreateRoleWithItems",
    update:"Law_Role/CreateRoleWithItems",
    getById:"Law_Role/GetRoleDetailsOnly_WithMenu",//"Law_Role/GetRoleDetails"
    getPermissionMenu:"Law_Role/GetAllRoleMenu",
    getPermissionMenuMenuDetails:"Law_Role/GetAllModuleItemsDetailsByParentMenuAndRole",
    createPermissionMenuMenuDetails:"Law_Role/GetAllModuleItemsDetailsByParentMenu"
  },
};