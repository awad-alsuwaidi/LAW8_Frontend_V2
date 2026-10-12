import {
  Component,
  input,
  Input,
  InputSignal,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ChartModule } from 'primeng/chart';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-dashboard-chart',
  standalone: true,
  imports: [ChartModule, TranslateModule,TooltipModule],
  templateUrl: './dashboard-chart.component.html',
  styleUrl: './dashboard-chart.component.scss',
})
export class DashboardChartComponent implements OnInit, OnChanges {
    type: InputSignal<
    | 'bar'
    | 'line'
    | 'scatter'
    | 'bubble'
    | 'pie'
    | 'doughnut'
    | 'polarArea'
    | 'radar'
    | undefined
  > = input<
    | 'bar'
    | 'line'
    | 'scatter'
    | 'bubble'
    | 'pie'
    | 'doughnut'
    | 'polarArea'
    | 'radar'
    | undefined
  >('doughnut');
  chartData: InputSignal<any[]> = input<any[]>([]);
  showLabel: InputSignal<boolean> = input<boolean>(true);
isManager: InputSignal<boolean> = input<boolean>(false);
  onGetData = output();
width: InputSignal<string> = input<string>('110px');
height: InputSignal<string> = input<string>('110px');
  data: any;
  options: any;

ngOnInit(): void {
  this.buildChart();
}

getPeriodLabelKey(): string {
  return this.isManager()
    ? 'dashboard.forLastYear'
    : 'dashboard.forLast30Days';
}

  getSideBarData(item: any) {
    this.onGetData.emit(item);
    
  }


  ngOnChanges(changes: SimpleChanges): void {
  if (changes['chartData']) {
    this.buildChart();
  }
}


buildChart() {
  const hasRealData = this.chartData().some((item: any) => item.value > 0);

  if (hasRealData) {
    this.data = {
      labels: this.chartData().map((v: any) => v.label),
      datasets: [
        {
          data: this.chartData().map((v: any) => v.value),
          backgroundColor: this.chartData().map((v: any) =>
            getComputedStyle(document.documentElement)
              .getPropertyValue(v.bgColor)
              .trim()
          ),
          borderWidth: 0,
        },
      ],
    };
  } else {
    this.data = {
      labels: ['Empty'],
      datasets: [
        {
          data: [1],
          backgroundColor: ['#f3f4f6'],
          borderWidth: 1,
          borderColor: ['#e5e7eb'],
        },
      ],
    };
  }

  // this.options = {
  //   cutout: this.type() === 'doughnut' ? '60%' : 0,
  //   plugins: {
  //     legend: { display: false },
  //     tooltip: {
  //       enabled: hasRealData,
  //       callbacks: {
  //         label: function (context: any) {
  //           return hasRealData ? context.label + ': ' + context.parsed : '';
  //         },
  //       },
  //     },
  //   },
  //   maintainAspectRatio: true,
  // };
this.options = {
  cutout: this.type() === 'doughnut' ? '60%' : 0,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: hasRealData,
      padding: 5,
      bodyFont: {
        size: 10
      },
      titleFont: {
        size: 12
      },
      callbacks: {
        label: function (context: any) {
          return hasRealData ? `${context.label}: ${context.parsed}` : '';
        },
      },
    },
  },
};

}


}
