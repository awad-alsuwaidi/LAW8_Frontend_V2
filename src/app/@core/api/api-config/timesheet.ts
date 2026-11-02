// export const Timesheet_API = {
//   "timesheet":{
//   //  "get":"TimeSheet/GetList",
//       "get":"TimeSheet/GetListForMatterById",
//       "getList":"TimeSheet/GetListTimeSheet",
//       "getById":"TimeSheet/GetByIdTimeSheet",
//       "getTempTimeSheet":"/GetTempTimeSheet/?empCode=",
//       "getClientNameByMatterId":"AppLookup/GetClientNameByMatterIdLookup",
//       "getRateFromLawyerIdAndMatterId":"AppLookup/GetClientNameAndRateByMatterId",
//       "getDraftTimeSheet":"TimeSheet/GetListWithoutPag",
//       "create":"TimeSheet/SubmitTemps",
//       "createe":"TimeSheet/Create",
//       "update":"TimeSheet/Update",
//       "deleteList":"TimeSheet/DeleteTimeSheet",
//       "delete":"TimeSheet/Delete",
//       "updateList":"TimeSheet/UpdateRowTimeSheet",
//   }

// }

// =====================================================
// Timesheet_API  —  LAW8 · Phase 10
// =====================================================
export const Timesheet_API = {
  timesheet: {
    // =============== NEW ===============
    lookups: 'lookups',
    users: 'MatterTimesheet/users',
    taskCodesByMatter: 'MatterTimesheet/task-codes',
    rateSuggestion: 'MatterTimesheet/rate-suggestion',
    batch: 'MatterTimesheet/batch',
    bulk: 'MatterTimesheet/bulk',
    pendingApproval: 'MatterTimesheet/pending-approval',
    summaryByUser: 'MatterTimesheet/summary/by-user',
    summaryByMatter: 'MatterTimesheet/summary/by-matter',
    list: 'MatterTimesheet',
    userRatesByUser: 'UserRates/by-user',
    userRatesUpdate: 'UserRates',
    securityDelegates: 'TimesheetSecurity/delegates',
    securityLockDate: 'TimesheetSecurity/lock-date',

    // =============== DEPRECATED (مؤقتًا — لحد ما الكومبوننتس تتحدث) ===============

    /** @deprecated استخدم `list` + `filters[statusCode]=Draft` */
    getDraftTimeSheet: 'TimeSheet/GetListWithoutPag',

    /** @deprecated استخدم `list` */
    getList: 'TimeSheet/GetListTimeSheet',

    /** @deprecated استخدم `list/{id}` */
    getById: 'TimeSheet/GetByIdTimeSheet',

    /** @deprecated استخدم `batch` */
    create: 'TimeSheet/SubmitTemps',

    /** @deprecated استخدم `batch` */
    createe: 'TimeSheet/Create',

    /** @deprecated استخدم `batch` */
    update: 'TimeSheet/Update',

    /** @deprecated استخدم `batch` */
    updateList: 'TimeSheet/UpdateRowTimeSheet',

    /** @deprecated استخدم `DELETE list/{id}` */
    delete: 'TimeSheet/Delete',

    /** @deprecated استخدم `DELETE list/{id}` */
    deleteList: 'TimeSheet/DeleteTimeSheet',

    /** @deprecated استخدم `rate-suggestion` */
    getRateFromLawyerIdAndMatterId: 'AppLookup/GetClientNameAndRateByMatterId',

    /** @deprecated استخدم رد `rate-suggestion` */
    getClientNameByMatterId: 'AppLookup/GetClientNameByMatterIdLookup',

    /** @deprecated مش مستخدم */
    getTempTimeSheet: '/GetTempTimeSheet/?empCode=',

    /** @deprecated استخدم `list` + `filters[view]=matter` */
    get: 'TimeSheet/GetListForMatterById',
  },
} as const;

// =====================================================
// General_API — ما تغيّر منه
// =====================================================
export const General_API = {
  general: {
    // ===== Batch lookups (موحّد) =====
    getBatchLookups: 'lookups', // ?types[]=x&types[]=y
    getMainMatters: 'lookups/matters',

    // ===== Recent matters (لا يوجد بديل في الـ batch) =====
    getRecentMatters: 'AppLookup/GetRecentMatterCodeForUserLookup',

    // ... باقي اللي موجود عندك زي ما هو (نفس الملف اللي انت بعتّه)
    // (activity-statuses, ... etc. مش لازم تلمسها)
  },
};

// =====================================================
// دالة مساعدة لبناء query string للـ batch lookups
// =====================================================
export function buildLookupsQuery(types: string[]): string {
  return types.map((t) => `types[]=${encodeURIComponent(t)}`).join('&');
}
