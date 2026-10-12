export const Lookups_API = {
  // ============================================================
  // ★★★ V2 — RESTful Endpoints الجديدة
  // ============================================================

  matterCategories: {
    get: 'mattercategories',
    getById: 'mattercategories',
    create: 'mattercategories',
    update: 'mattercategories',
    delete: 'mattercategories',
  },

  matterTypes: {
    get: 'mattertypes',
    getByCategory: 'mattertypes/by-category',
    getById: 'mattertypes',
    create: 'mattertypes',
    update: 'mattertypes',
    delete: 'mattertypes',
  },

  matterStatuses: {
    get: 'MatterStatuses',
    getById: 'MatterStatuses',
    create: 'MatterStatuses',
    update: 'MatterStatuses',
    delete: 'MatterStatuses',
  },

  stages: {
    get: 'matterstages',
    getById: 'matterstages',
    create: 'matterstages',
    update: 'matterstages',
    delete: 'matterstages',
  },

  clientGroups: {
    get: 'clientgroups',
    getById: 'clientgroups',
    create: 'clientgroups',
    update: 'clientgroups',
    delete: 'clientgroups',
  },

  referralTypes: {
    get: 'referraltypes',
    getById: 'referraltypes',
    create: 'referraltypes',
    update: 'referraltypes',
    delete: 'referraltypes',
  },

  partiesDescriptions: {
    get: 'partydescriptions',
    getById: 'partydescriptions',
    create: 'partydescriptions',
    update: 'partydescriptions',
    delete: 'partydescriptions',
  },

  adjournmentReasons: {
    get: 'adjournmentreasons',
    getById: 'adjournmentreasons',
    create: 'adjournmentreasons',
    update: 'adjournmentreasons',
    delete: 'adjournmentreasons',
  },

  taskCodes: {
    get: 'taskcodes',
    getById: 'taskcodes',
    create: 'taskcodes',
    update: 'taskcodes',
    delete: 'taskcodes',
  },

  taskCodesGroups: {
    get: 'taskcodegroups',
    getById: 'taskcodegroups',
    create: 'taskcodegroups',
    update: 'taskcodegroups',
    delete: 'taskcodegroups',
  },

  practiceAreas: {
    get: 'practiceareas',
    lookup: 'practiceareas',
    getById: 'practiceareas',
    create: 'practiceareas',
    update: 'practiceareas',
    delete: 'practiceareas',
  },

  departments: {
    get: 'Departments',
    getById: 'Departments',
    create: 'Departments',
    update: 'Departments',
    delete: 'Departments',
  },

  industries: {
    get: 'industries',
    getById: 'industries',
    create: 'industries',
    update: 'industries',
    delete: 'industries',
  },

  branches: {
    get: 'branches',
    getById: 'branches',
    create: 'branches',
    update: 'branches',
    delete: 'branches',
  },
  taskGroups: {
    get: 'taskgroups',
    getById: 'taskgroups',
    create: 'taskgroups',
    update: 'taskgroups',
    delete: 'taskgroups',
  },

  predefinedTasks: {
    get: 'predefinedtasks',
    getById: 'predefinedtasks',
    create: 'predefinedtasks',
    update: 'predefinedtasks',
    delete: 'predefinedtasks',
    download: 'predefinedtasks/download',
    lookupsUsers: 'predefinedtasks/lookups/users',
  },

  taskPriorities: {
    get: 'taskpriorities',
    getById: 'taskpriorities',
    create: 'taskpriorities',
    update: 'taskpriorities',
    delete: 'taskpriorities',
  },

  jurisdictions: {
    get: 'jurisdictions',
    getById: 'jurisdictions',
    create: 'jurisdictions',
    update: 'jurisdictions',
    delete: 'jurisdictions',
  },

  judicatures: {
    get: 'judicatures',
    getByJurisdiction: 'judicatures/by-jurisdiction',
    getById: 'judicatures',
    create: 'judicatures',
    update: 'judicatures',
    delete: 'judicatures',
  },

  rateTypes: {
    get: 'ratetypes',
    getById: 'ratetypes',
    create: 'ratetypes',
    update: 'ratetypes',
    delete: 'ratetypes',
  },
  rates: {
    get: 'rates',
    getByRateType: 'rates/by-ratetype',
    getById: 'rates',
    create: 'rates',
    update: 'rates',
    delete: 'rates',
  },

  bankAccounts: {
    get: 'bankaccounts',
    getById: 'bankaccounts',
    create: 'bankaccounts',
    update: 'bankaccounts',
    delete: 'bankaccounts',
  },
  bankAccountTypes: {
    get: 'bankaccounttypes',
    getById: 'bankaccounttypes',
    create: 'bankaccounttypes',
    update: 'bankaccounttypes',
    delete: 'bankaccounttypes',
  },
  glAccounts: {
    get: 'glaccounts',
    getById: 'glaccounts',
    create: 'glaccounts',
    update: 'glaccounts',
    delete: 'glaccounts',
  },
  glAccountTypes: {
    get: 'glaccounttypes',
    getById: 'glaccounttypes',
    create: 'glaccounttypes',
    update: 'glaccounttypes',
    delete: 'glaccounttypes',
  },
  glAccountCategories: {
    get: 'glaccountCategories',
    getById: 'glaccountCategories',
    create: 'glaccountCategories',
    update: 'glaccountCategories',
    delete: 'glaccountCategories',
  },
  costCenters: {
    get: 'costcenters',
    getById: 'costcenters',
    create: 'costcenters',
    update: 'costcenters',
    delete: 'costcenters',
  },

  // ============================================================
  // ★★★ V1 — RESTful Endpoints القديم
  // ============================================================

  matterCategory: {
    get: 'LawMtrCat/GetList',
    create: 'LawMtrCat/Create',
    update: 'LawMtrCat/Update',
    delete: 'LawMtrCat/Delete',
  },

  matterCategoryType: {
    get: 'LawMtrTyp/GetList',
    create: 'LawMtrTyp/Create',
    update: 'LawMtrTyp/Update',
    delete: 'LawMtrTyp/Delete',
  },

  practiceArea: {
    get: 'Law_PractsArea/GetList',
    create: 'Law_PractsArea/Create',
    update: 'Law_PractsArea/Update',
    delete: 'Law_PractsArea/Delete',
  },

  clientGroup: {
    get: 'ClientGroup/GetList',
    create: 'ClientGroup/Create',
    update: 'ClientGroup/Update',
    delete: 'ClientGroup/Delete',
  },

  department: {
    get: 'Law_Department/GetList',
    create: 'Law_Department/Create',
    update: 'Law_Department/Update',
    delete: 'Law_Department/Delete',
  },

  industry: {
    get: 'Law_Industry/GetList',
    create: 'Law_Industry/Create',
    update: 'Law_Industry/Update',
    delete: 'Law_Industry/Delete',
  },

  mattStatus: {
    get: 'Law_MattStatus/GetList',
    create: 'Law_MattStatus/Create',
    update: 'Law_MattStatus/Update',
    delete: 'Law_MattStatus/Delete',
  },

  referralType: {
    get: 'Law_ReferralType/GetList',
    create: 'Law_ReferralType/Create',
    update: 'Law_ReferralType/Update',
    delete: 'Law_ReferralType/Delete',
  },

  adjournmentReasonsOld: {
    get: 'Law_AdjournmentReasons/GetList',
    create: 'Law_AdjournmentReasons/Create',
    update: 'Law_AdjournmentReasons/Update',
    delete: 'Law_AdjournmentReasons/Delete',
  },

  partiesDescription: {
    get: 'Law_PartiesDescription/GetList',
    create: 'Law_PartiesDescription/Create',
    update: 'Law_PartiesDescription/Update',
    delete: 'Law_PartiesDescription/Delete',
  },

  stage: {
    get: 'Law_Stage/GetList',
    create: 'Law_Stage/Create',
    update: 'Law_Stage/Update',
    delete: 'Law_Stage/Delete',
  },

  taskCode: {
    get: 'Law_TaskCode/GetList',
    create: 'Law_TaskCode/Create',
    update: 'Law_TaskCode/Update',
    delete: 'Law_TaskCode/Delete',
  },

  taskCodesGroupOld: {
    get: 'Law_TaskCodesGroup/GetList',
    create: 'Law_TaskCodesGroup/Create',
    update: 'Law_TaskCodesGroup/Update',
    delete: 'Law_TaskCodesGroup/Delete',
  },

  rateType: {
    get: 'Law_RateType/GetList',
    create: 'Law_RateType/Create',
    update: 'Law_RateType/Update',
    delete: 'Law_RateType/Delete',
  },

  rate: {
    get: 'Law_Rate/GetList',
    create: 'Law_Rate/Create',
    update: 'Law_Rate/Update',
    delete: 'Law_Rate/Delete',
  },

  branch: {
    get: 'Law_Branch/GetList',
    create: 'Law_Branch/Create',
    update: 'Law_Branch/Update',
    delete: 'Law_Branch/Delete',
  },

  predefinedTasksOld: {
    get: 'Law_Predifiend_Tasks/GetList',
    create: 'Law_Predifiend_Tasks/Create',
    update: 'Law_Predifiend_Tasks/Update',
    delete: 'Law_Predifiend_Tasks/Delete',
    download: 'Law_Predifiend_Tasks/download',
    getById: 'Law_Predifiend_Tasks/GetById',
  },

  taskGroupsOld: {
    get: 'Law_Predifined_Task_Group/GetList',
    create: 'Law_Predifined_Task_Group/Create',
    update: 'Law_Predifined_Task_Group/Update',
    delete: 'Law_Predifined_Task_Group/Delete',
    getById: 'Law_Predifined_Task_Group/GetById',
  },

  bankAccount: {
    get: 'BankAccounts/GetList',
    getById: 'BankAccounts/GetById',
    create: 'BankAccounts/Create',
    update: 'BankAccounts/Update',
    delete: 'BankAccounts/Delete',
  },

  glAccount: {
    get: 'GlAccounts/GetList',
    getById: 'GlAccounts/GetById',
    create: 'GlAccounts/Create',
    update: 'GlAccounts/Update',
    delete: 'GlAccounts/Delete',
  },

  jurisdictionsOld: {
    get: 'Law_Jurisdiction/GetList',
    create: 'Law_Jurisdiction/Create',
    update: 'Law_Jurisdiction/Update',
    delete: 'Law_Jurisdiction/Delete',
  },

  judicature: {
    get: 'Law_Judicature/GetList',
    create: 'Law_Judicature/Create',
    update: 'Law_Judicature/Update',
    delete: 'Law_Judicature/Delete',
  },
};
