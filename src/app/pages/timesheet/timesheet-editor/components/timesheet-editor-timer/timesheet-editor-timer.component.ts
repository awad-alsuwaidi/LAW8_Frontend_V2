import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-timesheet-editor-timer',
  standalone: true,
  imports: [],
  templateUrl: './timesheet-editor-timer.component.html',
  styleUrl: './timesheet-editor-timer.component.scss',
})
export class TimesheetEditorTimerComponent
  implements OnInit, OnChanges, OnDestroy
{
  isPlay!: boolean;
  protected hours: number = 0;
  protected minutes: number = 0;
  protected seconds: number = 0;
  protected interval: any;
  private incrementValue: number = 0.1;
  @Input({ required: true }) data!: number;
  @Input() stopInterval: boolean = false;
  @Output() onStartTimer: any = new EventEmitter();
  @Output() onStopTimer: any = new EventEmitter();
  ngOnChanges(changes: SimpleChanges): void {
    if (
      !changes['stopInterval']?.currentValue &&
      changes['stopInterval']?.currentValue != undefined
    ) {
      this.stopTimer();
    }
  }
  ngOnInit(): void {
    this.hours = this.convertSecondsToHours();
    this.minutes = this.convertSecondsToMinutes();
    this.seconds = this.convertSeconds();
  }
  convertSecondsToHours() {
    return !isNaN(this.data) ? Math.floor(this.data / 3600) : 0;
  }
  convertSecondsToMinutes() {
    return !isNaN(this.data) ? Math.floor((this.data % 3600) / 60) : 0;
  }
  convertSeconds() {
    return !isNaN(this.data) ? this.data % 60 : 0;
  }

  toggleTimer() {
    this.isPlay = !this.isPlay;
    if (this.isPlay) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }
  startTimer() {
    this.onStartTimer.emit();
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
      this.calcHourRate();
    }, 1000);
  }
  stopTimer() {
    this.isPlay = false;
    clearInterval(this.interval);
  }
  updateHourIncrementBasedOnTimerSeconds() {
    const totalSeconds = !isNaN(this.data) ? this.data : 0;
    const minutes = totalSeconds / 60;
    const incrementCount = Math.floor(minutes / 6);
    return incrementCount * this.incrementValue;
  }
  calcHourRate() {
    const hourInSeconds = this.hours * 3600;
    const minInSeconds = this.minutes * 60;
    const totalSeconds = hourInSeconds + minInSeconds + this.seconds;
    const result = {
      hours:
        totalSeconds > 0
          ? this.calculateHourIncrementBasedOnTimerSeconds(totalSeconds)
          : 0,
      tsTimmer: totalSeconds,
    };
    this.onStopTimer.emit(result);
  }

  calculateHourIncrementBasedOnTimerSeconds(seconds: number) {
    const secondsToMinutes = seconds / 60;
    if (secondsToMinutes % 6 == 0 && secondsToMinutes > 0) {
      this.incrementValue += 0.1;
    }
    return parseFloat(this.incrementValue.toFixed(1));
  }
  ngOnDestroy(): void {
    this.stopTimer();
  }
}
