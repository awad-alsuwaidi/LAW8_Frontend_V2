import { DatePipe } from "@angular/common";

export function formatDate(date: any, format: string) {
    if (!date) return null;
  
  const datePipe = new DatePipe('en-US'); 
  return datePipe.transform(date, format);
}
