import { Component, Input, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CountByLabel } from '../../../models/dashboard.models';
import { TranslationService } from '../../../../auth/services/Translation.service';

interface LegendItem { label: string; key: string; color: string; value: number; }

const STATUS_COLORS: Record<string, string> = {
  Active:    '#12b76a',
  Suspended: '#f79009',
  Cancelled: '#f04438',
  Pending:   '#98a2b3',
};

@Component({
  selector: 'app-subscriptions-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './subscriptions-chart.html',
  styleUrl: './subscriptions-chart.scss',
})
export class SubscriptionsChart implements OnChanges {
  @Input() items: CountByLabel[] = [];
  private readonly i18n = inject(TranslationService);
  t = (k: string) => this.i18n.translate(k);

  chartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  legendItems: LegendItem[] = [];
  total = 0;

  readonly chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}` } },
    },
  };

  ngOnChanges(): void {
    const order = ['Active', 'Suspended', 'Cancelled', 'Pending'];
    const map = new Map(this.items.map(i => [i.label, i.count]));

    this.legendItems = order.map(key => ({
      key,
      label: this.t('subscriptions.status' + key),
      color: STATUS_COLORS[key],
      value: map.get(key) ?? 0,
    }));

    this.total = this.legendItems.reduce((s, i) => s + i.value, 0);

    this.chartData = {
      labels: this.legendItems.map(i => i.label),
      datasets: [{
        data: this.legendItems.map(i => i.value),
        backgroundColor: this.legendItems.map(i => i.color),
        hoverOffset: 6,
        borderWidth: 3,
        borderColor: '#fff',
        borderRadius: 6,
        spacing: 2,
      }],
    };
  }
}
