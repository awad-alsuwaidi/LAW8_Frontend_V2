export interface Permission {
  routeName: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
  canPrint: boolean;
}

export interface User {
  id: string;
  email: string;
  nameEn: string;
  nameAr?: string;
  roles: string[];
  permissions: Permission[];
  active: boolean;
  locked: boolean;
}
