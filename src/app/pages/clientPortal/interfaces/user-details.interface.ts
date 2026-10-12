export interface UserDetailsDto {
  id: string;
  nameEn: string;
  nameAr: string;
  userName: string;
  empNo: string;
  indstId: number;
  titleId: number;
  deptId: number;
  initial: string;
  telNo: null;
  mobileNo: null;
  email: string;
  defUsrId: null;
  goal: number;
  fileName: null;
  filePath: null;
  logoFile: null;
  timeSheetDate: string;
  permissions?: string[];
}
