export interface UserDetailsDto {
  id: string;
  nameEn: string;
  nameAr: string;
  userName: string;
  empNo: string;
  initial: string;
  industryId: number;
  titleId: number;
  departmentId: number;
  branchId: number;
  defaultUserId: string | null;
  phoneNumber: string | null;
  mobile2: string | null;
  phone: string | null;
  extension: string | null;
  email: string;
  goal: number;
  timesheetDate: string;
  fileName: string | null;
  filePath: string | null;
  logoFile: string | null;
}