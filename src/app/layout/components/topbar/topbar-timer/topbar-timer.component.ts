import { Component, Output, EventEmitter } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-topbar-timer',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './topbar-timer.component.html',
  styleUrls: ['./topbar-timer.component.scss'],
})
export class TopbarTimerComponent {
  isPlay!: boolean;
  protected hours: number = 0;
  protected minutes: number = 0;
  protected seconds: number = 0;
  protected interval: any;
  private incrementValue: number = 0.1;

  @Output() onStopTimer: EventEmitter<any> = new EventEmitter();
  hourRate: any;

  startTimer() {
    this.isPlay = true;
    this.interval = setInterval(() => {
      this.seconds++;
      if (this.seconds > 59) {
        this.seconds = 0;
        this.minutes++;
      }
      if (this.minutes > 59) {
        this.seconds = 0;
        this.minutes = 0;
        this.hours++;
      }
      this.calcHourRate();
    }, 1000);
  }

  stopTimer() {
    this.isPlay = false;
    this.onStopTimer.emit(this.hourRate);
    clearInterval(this.interval);
    this.resetTimer();
  }

  calcHourRate() {
    const hourInSeconds = this.hours * 3600;
    const minInSeconds = this.minutes * 60;
    const totalSeconds = hourInSeconds + minInSeconds + this.seconds;

    this.hourRate = {
      hours:
        totalSeconds > 0
          ? this.calculateHourIncrementBasedOnTimerSeconds(totalSeconds)
          : 0,
      tsTimmer: `${this.hours > 9 ? this.hours : '0' + this.hours}:${
        this.minutes > 9 ? this.minutes : '0' + this.minutes
      }:${this.seconds > 9 ? this.seconds : '0' + this.seconds}`,
    };
  }

  calculateHourIncrementBasedOnTimerSeconds(seconds: number) {
    const secondsToMinutes = seconds / 60;
    if (secondsToMinutes % 6 == 0 && secondsToMinutes > 0) {
      this.incrementValue += 0.1;
    }
    return parseFloat(this.incrementValue.toFixed(1));
  }

  resetTimer() {
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.incrementValue = 0.1;
    this.calcHourRate();
  }

  ngOnDestroy(): void {
    this.isPlay = false;
    clearInterval(this.interval);
  }
}
