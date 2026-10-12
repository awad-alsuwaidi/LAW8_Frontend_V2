export interface CalendarEventDto {
  id: number;
  mtrNo: string;
  law_ActivityTypeId: number;
  law_ActivityType: string;
  usrSign: string;
  startDate: string;
  isPrivate: boolean;
  law_ActivityStatusId?: number; 
}
