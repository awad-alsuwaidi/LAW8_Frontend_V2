import { Component, OnDestroy, OnInit } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-timer-field',
  templateUrl: './formly-timer-field.component.html',
  styleUrl: './formly-timer-field.component.scss'
})
export class FormlyTimerFieldComponent extends FieldType<FieldTypeConfig> implements OnInit, OnDestroy {


  isPlay!: boolean;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;
  interval: any;
  ngOnInit(): void {
    this.hours=this.convertSecondsToHours()
    this.minutes=this.convertSecondsToMinutes()
    this.seconds=this.convertSeconds()
  }
  convertSecondsToHours(){
    return Math.floor(this.formControl.value / 3600);
  }
  convertSecondsToMinutes(){
    return Math.floor((this.formControl.value % 3600) / 60);
  }
  convertSeconds(){
    return this.formControl.value % 60;
  }

  toggleTimer() {
    this.isPlay = !this.isPlay;
    if (this.isPlay) {
      this.startTimer()
    } else {
      this.stopTimer()
    }
  }
  startTimer() {
    this.interval = setInterval(() => {
      this.seconds++;
      if (this.seconds > 59) {
        this.seconds = 0;
        this.minutes++;
      } else if (this.minutes > 59) {
        this.seconds = 0;
        this.minutes = 0;
        this.hours++;
      }
    }, 1000)
  }
  stopTimer() {
    this.isPlay = false;
    clearInterval(this.interval);
  }
  ngOnDestroy(): void {
    this.stopTimer()
  }
}
