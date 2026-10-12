import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-dashboard-chart-skeleton',
  standalone: true,
  imports: [
    SkeletonModule
  ],
  templateUrl: './dashboard-chart-skeleton.component.html',
  styleUrl: './dashboard-chart-skeleton.component.scss'
})
export class DashboardChartSkeletonComponent {

}
