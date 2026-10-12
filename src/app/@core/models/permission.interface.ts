export type PermissionAction =
  | 'canRead'
  | 'canUpdate'
  | 'canDelete'
  | 'canSearch'
  | 'canPrint'
  | 'canExport';

export interface UserPermission {
  permissionId: number;
  routeName: string;
  nameEn: string;
  nameAr: string | null;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canSearch: boolean;
  canPrint: boolean;
  canExport: boolean;
  grantedBy: string[];
}

export interface UserRole {
  id: string | null;
  name: string;
  nameAr: string | null;
  isSystemRole: boolean;
}

export interface UserCapabilities {
  canSeeRates: boolean;
  canUseManagerDashboard: boolean;
  canApproveTimesheet: boolean;
  canApproveExpenses: boolean;
  canApproveCreditNotes: boolean;
}

export interface MeResponse {
  userId: string;
  userName: string;
  email: string;
  nameEn: string | null;
  nameAr: string | null;
  profileImageUrl: string;
  initial: string | null;
  branchName: string | null;
  departmentName: string | null;
  language: string | null;
  timeZone: string | null;
  roles: UserRole[];
  isAdmin: boolean;
  permissions: UserPermission[];
  capabilities: UserCapabilities;
  dashboards: string[];
  defaultDashboard: string;
}