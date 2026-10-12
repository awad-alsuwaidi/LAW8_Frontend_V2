import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsToTime',
  standalone: true
})
export class SecondsToTimePipe implements PipeTransform {

  transform(value: number): string {
    const minutes: any = String(Math.floor(value / 60)).padStart(2, '0');
    const seconds: any = String(value - minutes * 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

}
