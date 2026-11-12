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
    getDraftTimeSheet: 'TimeSheet/GetListWithoutPag',
    getList: 'TimeSheet/GetListTimeSheet',
    getById: 'TimeSheet/GetByIdTimeSheet',
    create: 'TimeSheet/SubmitTemps',
    createe: 'TimeSheet/Create',
    update: 'TimeSheet/Update',
    updateList: 'TimeSheet/UpdateRowTimeSheet',
    delete: 'TimeSheet/Delete',
    deleteList: 'TimeSheet/DeleteTimeSheet',
    getRateFromLawyerIdAndMatterId: 'AppLookup/GetClientNameAndRateByMatterId',
    getClientNameByMatterId: 'AppLookup/GetClientNameByMatterIdLookup',
    getTempTimeSheet: '/GetTempTimeSheet/?empCode=',
    get: 'TimeSheet/GetListForMatterById',
  },
} as const;


// =====================================================
// دالة مساعدة لبناء query string للـ batch lookups
// =====================================================
export function buildLookupsQuery(types: string[]): string {
  return types.map((t) => `types[]=${encodeURIComponent(t)}`).join('&');
}
