import { MatterAddressDto } from "./matter-address.interface";

export interface MatterDetailsDto {
    id: number;
    clientId: number;
    mtrTypeId: number;
    mtrType: string;
    practsAreaId: number;
    practsArea: string;
    stageId: number;
    stage: string;
    jurisdictionId: null;
    jurisdiction: null;
    judicatureId: null;
    judicature: null;
    statusId: number;
    status: string;
    law_TaskCodeId: number;
    law_TaskCode: string;
    law_MtrCatId: number;
    law_MtrCat: string;
    mtrNo: string;
    courtNumber: null;
    descr: string;
    openDate: string;
    defaultTaskTypeId: number;
    rateAmount: null;
    defaultRate: string;
    law_ReferralTypeId: null;
    law_ClientIntroducingId: null;
    law_ClientIntroducing: string;
    law_MatterIntroducingLawyer: string;
    law_ReferralType: string;
    law_MatterIntroducingLawyerId: null;
    law_ResponsibleLaywerId: string;
    law_ResponsibleLaywer: string;
    law_BranchId: number;
    law_Branch: string;
    notes: null;
    closeDate: null;
    cDate: string;
    usrSign: null;
    wordMark: null;
    isCaseSensitive: null;
    tradmarkTypeId: null;
    matterBalance: null;
    logoFileName: null;
    logoFilePath: null;
    client: string;
    logoFile: null;
    isActive: boolean;
    requestTypeId: number;
    law_AssignedLaywerList: any[];
    law_OtherStaffList: LawOtherStaffList[];
    law_MatterParties: any[];
    law_MatterAddresses: MatterAddressDto[];
    law_MatterContactss: any[];
    law_MatterClasses: any[];
    law_MatterApplicantss: any[];
    parentMatterId: null;
    law_InstructorId: null;
}


interface LawOtherStaffList {
    id: string;
    name: string;
}