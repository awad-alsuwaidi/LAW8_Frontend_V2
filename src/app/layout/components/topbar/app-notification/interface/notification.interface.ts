// export interface NotificationDto {
//   id: number;
//   law_MatterId: number;
//   lable: string;
//   module: string;
//   message: string;
//   actionDate: string;
//   seen?:boolean
// }

import { NotificationStatus } from "src/app/pages/notifications/notification-status.enum";



export interface NotificationDto {
  id: number;
  law_MatterId: number;
  lable: string;
  module: string;
  message: string;
  actionDate: string;

  statusId: NotificationStatus;

  sourceType?: 'Matter' | 'Activity' | 'Task';
  sourceId?: number;

  byUserName?: string;
  matterNo?: string;
  activityCode?: string;
  priority?: string;
  description?: string;

  hasAccess?: boolean;
  isDeleted?: boolean;
  stageId?: number;

  type?: string;
}