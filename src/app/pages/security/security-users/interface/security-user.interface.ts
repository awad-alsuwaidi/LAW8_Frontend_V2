export interface SecurityUserDto  {
  id: string;
  name: string;
  userName: string;
  indstId: number;
  titleId: number;
  deptId: number;
  empNo: string;
  initial: string;
  active: boolean;
  locked: boolean;
  telNo: string;
  mobileNo: string;
  email: string;
  defUsrId: string;
  goal: number;
  timeSheetDate: string;
  indst: string;
  depart: string;
  title: string;
  fileName: null;
  filePath: null;
  extension: null;
  userGroups?: string[] | null; 
  groups?: string[];
}