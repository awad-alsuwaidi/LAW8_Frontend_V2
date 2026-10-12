import { Component, effect, inject, input, Input, InputSignal } from '@angular/core';
import { SharedModule } from 'src/app/@shared/shared.module';
import { DashboardChartComponent } from '../dashboard-chart/dashboard-chart.component';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { finalize } from 'rxjs';
import { ApiService } from 'src/app/@core/api/api.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { DashboardDurationtimesheetFilterEditorComponent } from './components/dashboard-durationtimesheet-filter-editor/dashboard-durationtimesheet-filter-editor.component';
import { DashboardTimesheetSkeletonComponent } from './components/dashboard-timesheet-skeleton/dashboard-timesheet-skeleton.component';
import { DashboardDuration } from '../../enums/dashboard-duration';

@Component({
  selector: 'app-dashboard-timesheet',
  standalone: true,
  imports: [
    SharedModule,
    DashboardChartComponent,
    DashboardDurationtimesheetFilterEditorComponent,
    DashboardTimesheetSkeletonComponent
  ],
  templateUrl: './dashboard-timesheet.component.html',
  styleUrl: './dashboard-timesheet.component.scss'
})
export class DashboardTimesheetComponent {
  private _unsubscribe = inject(UnsubscribeService);
  private _apiService = inject(ApiService);
  isManager: InputSignal<boolean> = input<boolean>(false);
  timesheet: any = [];
  isLoading: boolean = false;
  timesheetCounts: any = {
    billableCount: 0,
    nonBillableCount: 0,
    noChargeCount: 0,
    totalTakenCount: 0,
    remainingCount: 0,
    plannedThisMonthCount: 0
  };
  filterOptions: any = {
    pageNum: 1,
    orderByDirection: 'ASC'
  };

  signalEffect = effect(() => {
    this.getTimesheetStatistics()
  })
  onFilter(filterValue: any) {
    this.filterOptions = {
      ...this.filterOptions,
      ...filterValue
    }
    this.getTimesheetStatistics()
  }
  getTimesheetStatistics() {
    const params = {
      beriod: DashboardDuration.today,
      ...this.filterOptions,
      isManagerDashboard: this.isManager()
    };

     this.isLoading = true;

    this._apiService
      .get(API_Config.timeSheetDashBoard.get, params)
      .pipe(
        finalize(() => this.isLoading = false),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: any) => {
          const result = res?.result?.[0] || {};

          this.timesheetCounts = result;

          this.timesheet = [
            {
              label: 'Billable',
              value: result.billableCount,
              bgColor: '--success-600'
            },
            {
              label: 'Non-Billable',
              value: result.nonBillableCount,
              bgColor: '--success-400'
            },
            {
              label: 'No Charge',
              value: result.noChargeCount,
              bgColor: '--success-200'
            },
            {
              label: 'Total Taken',
              value: result.totalTakenCount,
              bgColor: '--bluegray-200'
            },
            {
              label: 'Remaining',
              value: result.remainingCount,
              bgColor: '--grey-300'
            },
            {
              label: 'Planned (This Month)',
              value: result.plannedThisMonthCount,
              bgColor: '--primary-200'
            }
          ];
        }
      });
  }

}
