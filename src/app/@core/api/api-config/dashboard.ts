export const Dashboard_API = {
  dashboard: {
    get: 'DashboardV2/GetAllBoxesCount',
    // getClients: 'Dashboard/GetClients',
    // getNewClients:'Dashboard/GetNewClients',
    getMatters: '/GetUserRelMatterList/?id=',
    getActivities: '/GetUserRelActivityList/?id=',
    getSessions: '/GetUserRelActivityList/?id=',
  },
  clientDashboard: {
    get: 'DashboardV2/GetAllClients'
  },
  newClientDashboard: {
    get: 'DashboardV2/GetNewAllClients'
  },
  newMattersDashboard: {
    get: 'DashboardV2/GetNewMatterList'
  },
  activeMatterDashboard: {
    get: 'DashboardV2/GetActiveMatterList'
  },
  // closedMattersDashboard:{
  //   get:'Dashboard/GetClosedMatterList'
  // },
  // activitiesDashboard:{
  //   get:'Dashboard/GetActivityList'
  // },
  // pasthiringSessionList:{
  //   get:'Dashboard/GetPastHiringSessionList'
  // },
  // upcomingHearingSessions:{
  //   get:'Dashboard/GetUpcomingHearingSessionsList'
  // },
  importantMatterDashboard: {
    get: 'DashboardV2/GetImportentMatterList'
  },
  activityDashboard: {
    get: 'DashboardV2/GetActivityList'
  },
  activitytaskMangement: {
    get: 'DashboardV2/GetActivityList_ViewAllData'
  },
  taskDashboard: {
    get: 'DashboardV2/GetTasksList'
  },
  hearingSessiontaskMangement: {
    // get: 'DashboardV2/GetHearingSessionActivityList_ViewAll'
    get: 'DashboardV2/GetHearingSessionActivityList_ViewAll'
  },
  hearingSessionDashboard: {
    get: 'DashboardV2/GetHearingSessionActivityList'
  },
  timeSheetDashBoard: {
    get: 'DashboardV2/GetTimeSheetDashBoard'
  },
  // dashboardlayout:{
  //       get: 'Dashboard/UsersDashBoardGet',
  //       post: 'Dashboard/UsersDashBoardAdd',
  // }
};
