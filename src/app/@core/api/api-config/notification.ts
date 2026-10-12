import { environment } from "src/environments/environment";

export const Notification_API = {
    notification: {
      get: 'Notification/GetNotification',
      changeStatus:'Notification/ChangeNotificationStatus',
      remarkAll:'Notification/RemarkAllNotificationStatus',
      getCount:'Notification/GetNotificationCount',
      signalhub: environment.baseUrl + '/signalhub',
      remarkNotifiNotificationStatus: 'Notification/RemarkNotifiNotificationStatus',
      getAllByFilter:'Notification/GetAllNotificationByFilliter'
    },
  };