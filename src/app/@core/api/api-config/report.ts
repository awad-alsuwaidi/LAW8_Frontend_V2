export const Report_API = {
  report: {
    get: 'Report/TestReportArr',
    // create:'Law_MatterActivity/GetMatterActivityReport'
    create: 'ReportsDev/MattersActivitesReport',
    // create:'Law_MatterActivity/GetMatterActivityForReport'
  },
  matterReport: {
    create: 'ReportsDev/MattersReport',
  },
    clientsReport: {
    create: 'ReportsDev/clientsReport',
  },
  utilizationReport: {
    create: 'ReportsDev/UtilizationReport',
  },
  ProductivityReport: {
    create: 'ReportsDev/ProductivityReport',
  },
  timesheetReport: {
    // create:'TimeSheet/GetTimeSheetReport'
    create: 'ReportsDev/TimeSheetReport',
  },
    arReport: {
    create: 'ReportsDev/AgingReportPrint',
  },
};
