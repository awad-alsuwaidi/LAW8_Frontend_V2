import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-dashboard-timesheet-skeleton',
  standalone: true,
  imports: [
    SkeletonModule
  ],
  templateUrl: './dashboard-timesheet-skeleton.component.html',
  styleUrl: './dashboard-timesheet-skeleton.component.scss'
})
export class DashboardTimesheetSkeletonComponent {

}
