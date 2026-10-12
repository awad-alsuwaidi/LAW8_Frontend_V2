export const Timesheet_API = {
  "timesheet":{
  //  "get":"TimeSheet/GetList",
      "get":"TimeSheet/GetListForMatterById",
      "getList":"TimeSheet/GetListTimeSheet",
      "getById":"TimeSheet/GetByIdTimeSheet",
      "getTempTimeSheet":"/GetTempTimeSheet/?empCode=",
      "getClientNameByMatterId":"AppLookup/GetClientNameByMatterIdLookup",
      "getRateFromLawyerIdAndMatterId":"AppLookup/GetClientNameAndRateByMatterId",
      "getDraftTimeSheet":"TimeSheet/GetListWithoutPag",
      "create":"TimeSheet/SubmitTemps",
      "createe":"TimeSheet/Create",
      "update":"TimeSheet/Update",
      "deleteList":"TimeSheet/DeleteTimeSheet",
      "delete":"TimeSheet/Delete",
      "updateList":"TimeSheet/UpdateRowTimeSheet",
  }

}
