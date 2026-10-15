import { environment } from 'src/environments/environment';
import { MenuItem } from './menu.model';
const isInhouse = environment.brand === 'inhouse';
export class Menu {
  public static pages: MenuItem[] = [
    {
      items: [
        {
          icon: 'icon-home',
          label: 'menu.dashboard',
          route: '/dashboard',
          permission: 'dashboard',
        },

        {
          icon: 'icon-clients',
          label: isInhouse ? 'menu.entities' : 'menu.clients',
          route: '/clients',
          permission: 'View_Client',
          children: [
            {
              label: isInhouse ? 'menu.newEntity' : 'menu.newclients',
              route: '/clients/add',
              permission: 'Add_Client',
            },
            {
              label: isInhouse ? 'menu.entityList' : 'menu.clientsList',
              route: '/clients',
              permission: 'View_Client',
              activeMatchers: [
                /^\/clients\/view\/[^/]+$/,
                /^\/clients\/edit\/[^/]+$/,
                /^\/clients\/view\/[^/]+\/related-matters$/,
                /^\/clients\/view\/[^/]+\/contacts$/,
              ],
            },
            {
              label: isInhouse
                ? 'menu.inactiveEntities'
                : 'menu.inactiveClients',
              route: '/clients/inactive',
              permission: 'View_InactiveClient',
              activeMatchers: [
                /^\/clients\/inactive\/view\/[^/]+$/,
                /^\/clients\/inactive\/edit\/[^/]+$/,
                /^\/clients\/inactive\/view\/[^/]+\/related-matters$/,
                /^\/clients\/inactive\/view\/[^/]+\/contacts$/,
              ],
            },
          ],
        },

        {
          icon: 'icon-matters',
          label: 'menu.matters',
          route: '/matters',
          permission: 'View_Matter',

          children: [
            {
              label: 'menu.newMatter',
              route: '/matters/add',
              permission: 'Add_Matter',
              activeMatchers: [
                /^\/matters\/add$/,
                /^\/matters\/add\/applicant$/,
                /^\/matters\/add\/billing$/,
                /^\/matters\/add\/parties$/,
              ],
            },
            {
              label: 'menu.menu',
              route: '/matters',
              permission: 'View_Matter',
              activeMatchers: [
                /^\/matters\/\d+$/,
                /^\/matters\/favourite$/,
                /^\/matters\/\d+\/details$/,
                /^\/matters\/\d+\/invoice$/,
                /^\/matters\/\d+\/parties$/,
                /^\/matters\/\d+\/timesheet$/,
                /^\/matters\/\d+\/billing$/,
                /^\/matters\/\d+\/related-matters$/,
                /^\/matters\/\d+\/contacts$/,
                /^\/matters\/\d+\/attachments$/,
                /^\/matters\/\d+\/tasks$/,
                /^\/matters\/\d+\/activities$/,
                /^\/matters\/edit\/\d+$/,
              ],
            },
            {
              label: 'menu.inactiveMatters',
              route: '/matters/inactive',
              permission: 'Inactivate_MatterList_View',
              activeMatchers: [
                /^\/matters\/inactive\/\d+$/,
                /^\/matters\/inactive\/\d+\/details$/,
                /^\/matters\/inactive\/\d+\/invoice$/,
                /^\/matters\/inactive\/\d+\/parties$/,
                /^\/matters\/inactive\/\d+\/timesheet$/,
                /^\/matters\/inactive\/\d+\/billing$/,
                /^\/matters\/inactive\/\d+\/related-matters$/,
                /^\/matters\/inactive\/\d+\/contacts$/,
                /^\/matters\/inactive\/\d+\/attachments$/,
                /^\/matters\/inactive\/\d+\/tasks$/,
                /^\/matters\/inactive\/\d+\/activities$/,
              ],
            },
          ],
        },

        {
          icon: 'icon-contacts',
          label: 'common.contacts',
          route: '/contacts',
          permission: 'View_Contacts1',
        },

        {
          icon: 'icon-task',
          label: 'menu.taskManagement',
          route: '/task-management',
          permission: 'View_TaskManagement',

          children: [
            {
              label: 'menu.tasks',
              route: '/task-management/task/my-tasks',
              permission: 'View_TaskManagement',
              activeMatchers: [
                /^\/task-management\/task\/my-tasks$/,
                /^\/task-management\/task\/assignee-tasks$/,
              ],
            },

            {
              label: 'menu.hearingSession',
              route: '/task-management/hearing-session',
              permission: 'View_TaskManagement',
            },
            {
              label: 'menu.activity',
              route: '/task-management/activity',
              permission: 'View_TaskManagement',
            },
            {
              label: 'menu.calendar',
              route: '/task-management/calendar',
              permission: 'Calender',
            },
          ],
        },

        {
          icon: 'icon-timesheet',
          label: 'menu.timesheet',
          route: '/timesheet',
          permission: 'View_Timesheet',

          children: [
            {
              label: 'menu.addTimesheet',
              route: '/timesheet/add',
              permission: 'Add_Timesheet',
            },
            {
              label: 'menu.timesheetlist',
              route: '/timesheet',
              permission: 'View_Timesheet',
            },
          ],
        },

        {
          icon: 'icon-users',
          label: 'menu.users',
          route: '/users',
          // permission: 'View_Users',
          activeMatchers: [
            /^\/users\/.*/,
            /^\/users\/view\/[^/]+$/,
            /^\/users\/edit\/[^/]+$/,
          ],
        },

        {
          icon: 'icon-wallet-money',
          label: 'menu.billing',
          route: '/billing',
          permission: 'View_Billing',
          children: [
            {
              label: 'menu.preBill',
              route: '/billing/pre-bill/add',
              permission: 'PreBill_BillCreation',
            },
            {
              label: 'menu.createBills',
              route: '/billing/bills/add',
              permission: 'Bill_BillCreation',
            },
            {
              label: 'menu.quickBill',
              route: '/billing/quick-bill/add',
              permission: 'QuickBill_BillCreation',
            },
            {
              label: 'menu.billList',
              route: '/billing/bills',
              permission: 'View_BillList',
            },
          ],
        },

        {
          icon: 'icon-book',
          label: 'menu.accounts',
          route: '/accounts',
          permission: 'View_Accounts1',
          children: [
            {
              label: 'menu.addExpenses',
              route: '/accounts/expenses/add',
              permission: 'Add_Expenses1',
            },
            {
              label: 'menu.expensesList',
              route: '/accounts/expenses',
              permission: 'View_Expenses1',
            },
            {
              label: 'menu.receivePayment',
              route: '/accounts/recieve-payment',
              permission: 'View_ReceivePayment1',
            },
            {
              label: 'menu.paymentlist',
              route: '/accounts/payments-list',
              permission: 'View_Payment1',
            },
            {
              label: 'menu.addfees',
              route: '/accounts/fees/add',
              permission: 'Add_Fees1',
            },
            {
              label: 'menu.fees',
              route: '/accounts/fees',
              permission: 'View_Fees1',
            },
          ],
        },

        {
          icon: 'icon-lookups',
          label: 'menu.lookups',
          route: '/lookups',
          activeMatchers: [/^\/lookups\/.*/],
        },
        {
          icon: 'icon-report',
          label: 'menu.reports',
          route: '/reports',
          permission: 'View_Report',

          children: [
            {
              label: 'menu.activityreport',
              route: '/reports/activity',
              permission: 'Activity_ViewReports',
            },
            {
              label: 'menu.activityreport2',
              route: '/reports/activity2',
              permission: 'Activity_ViewReports',
            },
            {
              label: 'menu.matterReport',
              route: '/reports/matter',
              permission: 'Matter_ViewReports',
            },
            {
              label: isInhouse ? 'menu.entityReport' : 'menu.clientReport',
              route: '/reports/client',
              permission: 'Clients_ViewReport',
            },
            {
              label: 'menu.timeSheetReport',
              route: '/reports/timesheet',
              permission: 'TimeSheet_ViewReports',
            },
            {
              label: 'menu.productivityReport',
              route: '/reports/productivity',
              permission: 'Productivity_ViewReports',
            },
            {
              label: 'menu.utilizationReport',
              route: '/reports/utilization',
              permission: 'Utilization_ViewReports',
            },
            {
              label: 'menu.documentExpiryTracker',
              route: '/reports/document-expiry-tracker',
              permission: 'DocumentExpiry_ViewReports',
            },
            {
              label: 'menu.billing',
              permission: 'View_AR-Report',
              children: [
                {
                  label: 'menu.aRReport',
                  route: '/reports/billing/ar-report',
                  permission: 'View_AR-Report',
                },
              ],
            },
          ],
        },
        {
          icon: 'icon-omega-circle',
          label: 'menu.clientportal',
          route: '/portal',
          permission: 'ClientPortal',
          activeMatchers: [
            /^\/portal\/.*/,
            /^\/portal\/view\/[^/]+$/,
            /^\/portal\/edit\/[^/]+$/,
          ],
        },
        {
          icon: 'icon-security',
          label: 'menu.security',
          route: '/security',
          permission: 'View_Security',
          activeMatchers: [/^\/security\/.*/],
        },
      ],
    },
    {
      items: [
        {
          icon: 'icon-setting',
          label: 'menu.settingsAndManage',
          route: '/settings',
          permission: 'View_Settings1',
        },
        {
          icon: 'icon-help',
          label: 'menu.getHelp',
          permission: 'View_Settings1',
          // route: '/',
        },
      ],
    },
  ];
}
