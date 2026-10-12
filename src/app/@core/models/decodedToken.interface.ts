interface UserInfo {
    Id: string;
    NameEn: string;
    NameAr: string;
    UserName: string;
    IndstId: number;
    TitleId: number;
    DeptId: number;
    Initial: string;
    TelNo: string;
    MobileNo: string;
    Email: string;
    DefUsrId: string;
    Goal: number;
    TimeSheetDate: string;
    BranchId: null;
}
export interface DecodedToken {
    email: string;
    Id: string;
    UserName: string;
    NameAr: string;
    NameEn: string;
    DefUsrId: string;
    UserInfo: string;
    role: string[];
    nbf: number;
    exp: number;
    iat: number;
    iss: string;
    aud: string;
}


