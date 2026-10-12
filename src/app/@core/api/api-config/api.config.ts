import { Auth_API } from './auth';
import { Calendar_Security_API } from './security/calendar-security';
import { Clients_API } from './clients';
import { Dashboard_API } from './dashboard';
import { General_API } from './general';
import { Lookups_API } from './lookups';
import { Permission_API } from './security/permission';
import { Security_API } from './security/security';
import { Timesheet_API } from './timesheet';
import { Timesheet_Security_API } from './security/timesheet-security';
import { User_Group_API } from './security/userGroup';
import { Users_API } from './users';
import { Matter_Client_Security_API } from './security/matter-client-security';
import { Reponsable_Lawyer_Security_API } from './security/reponsable-lawyer-security';
import { Matter_Jurisdiction_Security_API } from './security/matter-jurisdiction-security';
import { Matter_Include_Security_API } from './security/matter-include-security';
import { Matter_Exclude_Security_API } from './security/matter-exclude-security';
import { Matters_API } from './matters';
import { Matters_Contact_API } from './matter-contact';
import { Matters_Address_API } from './matter-address';
import { Matters_Parties_API } from './matter-parties';
import { Matters_Applicants_API } from './matter-applicants';
import { Matters_Class_API } from './matter-class';
import { Class_API } from './class';
import { Matters_Activity_API } from './matter-activity';
import { Matters_Related_Matter_API } from './matter-related-matter';
import { Matters_Documents_API } from './matter-documents';
import { Matters_Time_Sheet_API } from './matter-timesheet';
import { Clients_Contact_API } from './client-contacts';
import { Task_Management_Calender_API } from './task-managment-calender';
import { Users_Rate_API } from './user-rate';
import { Profile_API } from './profile';
import { InActive_Matters_API } from './inactive-matters';
import { Report_API } from './report';
import { Search_API } from './search';
import { Notification_API } from './notification';
import { setting_API } from './setting';
import { Matters_Task_API } from './matter-tasks';
import { Matters_Task_Group_API } from './matter-task-group';
import { Matters_Invoice_API } from './matter-invoice';
import { Matters_Billing_API } from './matter-billing';
import { Matters_BillingException_API } from './billing-exception';
import { Users_Security_API } from './security/users-security';
import { Bill_API } from './bill';
import { Group_Secuirty_API } from './security/group-security';
import { Billing_Expenses_API } from './billing-expenses';
import { Quick_Bill_API } from './security/quick-bill';
import { Contacts_API } from './contacts';
import { RecievePayment_API } from './recieve-payment';

export const API_Config = {
  ...General_API,
  ...Auth_API,
  ...Clients_API,
  ...Clients_Contact_API,
  ...Dashboard_API,
  ...Timesheet_API,
  ...Security_API,
  ...Permission_API,
  ...Users_API,
  ...User_Group_API,
  ...Timesheet_Security_API,
  ...Calendar_Security_API,
  ...Matter_Client_Security_API,
  ...Reponsable_Lawyer_Security_API,
  ...Matter_Jurisdiction_Security_API,
  ...Matter_Include_Security_API,
  ...Matter_Exclude_Security_API,
  ...Matters_API,
  ...InActive_Matters_API,
  ...Matters_Contact_API,
  ...Matters_Address_API,
  ...Matters_Parties_API,
  ...Matters_Applicants_API,
  ...Matters_Class_API,
  ...Class_API,
  ...Matters_Activity_API,
  ...Matters_Related_Matter_API,
  ...Matters_Documents_API,
  ...Lookups_API,
  ...Task_Management_Calender_API,
  ...Users_Rate_API,
  ...Profile_API,
  ...Matters_Time_Sheet_API,
  ...Report_API,
  ...Search_API,
  ...Notification_API,
  ...setting_API,
  ...Matters_Task_API,
  ...Matters_Task_Group_API,
  ...Matters_Invoice_API,
  ...Matters_Billing_API,
  ...Matters_BillingException_API,
  ...Users_API,
  ...Users_Security_API,
  ...Bill_API,
  ...Group_Secuirty_API,
  ...Billing_Expenses_API,
  ...Quick_Bill_API,
  ...Contacts_API,
  ...RecievePayment_API
};
