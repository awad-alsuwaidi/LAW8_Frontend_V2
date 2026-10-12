import { environment } from "src/environments/environment";
const isInhouse = environment.brand === 'inhouse';
export const MATTERS_LIST:any[] = [
    {
      id: 1,
      nameEN: 'Matter Status',
      nameAR: 'حالة القضية',
      permission:'View_MatterStatus'
    },
    {
      id: 2,
      nameEN: 'Matter Stage',
      nameAR: 'درجات القضية',
      permission:'View_Stage'
    },
    {
      id: 3,
      nameEN: isInhouse ? 'Entity group' : 'Client group',
      nameAR: isInhouse ? 'مجموعات الجهات' : 'مجموعات العملاء',
      permission: 'View_ClientGroup'
    },
    {
      id: 4,
      nameEN: 'Referral Type',
      nameAR: 'نوع الترشيح',
      permission:'View_ReferralType'
    },
    {
      id: 5,
      nameEN: 'Parties description',
      nameAR: 'صفه الأطراف',
      permission:'View_PartiesDescription'
    },
    {
      id: 6,
      nameEN: 'Adjournment reasons',
      nameAR: 'سبب التأجيل',
      permission:'View_AdjournmentReasons'
    },
    {
      id: 7,
      nameEN: 'Billing Task Code',
      nameAR: 'نوع مهمه الفواتير',
      permission:'View_TaskCode',

    },
    {
      id: 8,
      nameEN: 'Practice Area',
      nameAR: 'مجال التخصص',
      permission:'View_PractsArea'
    },
    {
      id: 9,
      nameEN: 'Department',
      nameAR: 'الاقسام',
      permission:'View_Department'
    },
    {
      id: 10,
      nameEN: 'Industry',
      nameAR: 'المجال الوظيفي',
      permission:'View_Industry'
    },
    {
      id: 11,
      nameEN: 'Branches',
      nameAR: 'الفروع',
      permission:'View_Branch'
    },
    // {
    //   id: 12,
    //   nameEN: 'Recovery Type',
    //   nameAR: 'نوع الاسترداد',
    //   permission:'View_Branch'
    // },
    //  {
    //   id: 13,
    //   nameEN: 'Billing Task Groups',
    //   nameAR: 'نوع مجموعة مهمه الفواتير',
    //   permission:'View_Law_TaskCodesGroup',
    // },
  ]