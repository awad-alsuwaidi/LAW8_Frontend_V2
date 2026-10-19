export interface UserDto {
  id: string;
  nameEn: string;
  nameAr: string;
  name: string;
  userName: string;
  empNo: string | null;
  initial: string;
  industryId: number;
  titleId: number;
  departmentId: number;
  departmentName: string;
  branchId: number;
  active: boolean;
  locked: boolean;
  phoneNumber: string | null;
  mobile2: string | null;
  phone: string | null;
  email: string;
  defaultUserId: string | null;
  goal: number | null;
  timesheetDate: string | null;
  indst: string | null;
  depart: string | null;
  title: string | null;
  profileImageUrl: string | null;
  roles: string[];
  roleLabel: string;
}