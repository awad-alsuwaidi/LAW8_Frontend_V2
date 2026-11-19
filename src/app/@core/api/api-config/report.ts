// export const Report_API = {
//   report: {
//     get: 'Report/TestReportArr',
//     // create:'Law_MatterActivity/GetMatterActivityReport'
//     create: 'ReportsDev/MattersActivitesReport',
//     // create:'Law_MatterActivity/GetMatterActivityForReport'
//   },
//   matterReport: {
//     create: 'ReportsDev/MattersReport',
//   },
//     clientsReport: {
//     create: 'ReportsDev/clientsReport',
//   },
//   utilizationReport: {
//     create: 'ReportsDev/UtilizationReport',
//   },
//   ProductivityReport: {
//     create: 'ReportsDev/ProductivityReport',
//   },
//   timesheetReport: {
//     // create:'TimeSheet/GetTimeSheetReport'
//     create: 'ReportsDev/TimeSheetReport',
//   },
//     arReport: {
//     create: 'ReportsDev/AgingReportPrint',
//   },
// };

export const Report_API = {
  activitiesReport: {
    export: 'Reports/activities/export',
    list: 'Reports/activities',
    create: 'Reports/activities/export', // @deprecated
  },
  agingReport: {
    export: 'Reports/aging/export',
    list: 'Reports/aging',
    create: 'Reports/aging/export', // @deprecated
  },
  appealDeadlinesReport: {
    export: 'Reports/appeal-deadlines/export',
    list: 'Reports/appeal-deadlines',
    create: 'Reports/appeal-deadlines/export',
  },
  clientsReport: {
    export: 'Reports/clients/export',
    list: 'Reports/clients',
    create: 'Reports/clients/export',
  },
  documentExpiryReport: {
    export: 'Reports/document-expiry/export',
    list: 'Reports/document-expiry',
    create: 'Reports/document-expiry/export',
  },
  hearingSessionsReport: {
    export: 'Reports/hearing-sessions/export',
    list: 'Reports/hearing-sessions',
    create: 'Reports/hearing-sessions/export',
  },
  invoicesReport: {
    export: 'Reports/invoices/export',
    list: 'Reports/invoices',
    create: 'Reports/invoices/export',
  },
  mattersReport: {
    export: 'Reports/matters/export',
    list: 'Reports/matters',
    create: 'Reports/matters/export',
  },
  productivityReport: {
    export: 'Reports/productivity/export',
    list: 'Reports/productivity',
    create: 'Reports/productivity/export',
  },
  timesheetReport: {
    export: 'Reports/timesheet/export',
    list: 'Reports/timesheet',
    create: 'Reports/timesheet/export',
  },
  topClientsReport: {
    list: 'Reports/top-clients',
  },
  utilizationReport: {
    export: 'Reports/utilization/export',
    list: 'Reports/utilization',
    create: 'Reports/utilization/export',
  },
  arReport: {
    create: 'Reports/aging/export',
  },
};
