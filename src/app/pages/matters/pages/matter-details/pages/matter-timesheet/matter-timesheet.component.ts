import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedModule } from 'src/app/@shared/shared.module';
import { Matter_Timesheet_Columns } from './matter-timesheet-columns.config';
import { MatterTimesheetDto } from 'src/app/pages/matters/interfaces/matter-timesheet.interface';
import { ApiService } from 'src/app/@core/api/api.service';
import { LanguageService } from 'src/app/@core/services';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-matter-timesheet',
  standalone: true,
  imports: [TableModule, SharedModule, PaginatorModule],
  templateUrl: './matter-timesheet.component.html',
  styleUrl: './matter-timesheet.component.scss',
})
export class MatterTimesheetComponent implements OnInit, OnDestroy {
  _permissionService = inject(PermissionService);

  _languageService = inject(LanguageService);
  _unsubscribeService = inject(UnsubscribeService);
  _apiService = inject(ApiService);
  data: MatterTimesheetDto[] = [];
  totalRecords: number = 0;
  matterTimesheetColumns = Matter_Timesheet_Columns;
  filterOptions: any = {
    pageNum: 1,
    pagSize: 10,
    orderByDirection: 'ASC',
  };
  sortField = '';
  sortOrder = 1; 
  
  @Input() set id(value: number) {
    this.matterIdentifier = value;
  }
  matterIdentifier?: number;
  ngOnInit(): void {
    this.getData();
  }

  isLoading!: boolean;

get visibleColumns() {
  return this.matterTimesheetColumns.filter(col =>
    !col.requiredPermission ||
    this._permissionService.hasPermission(col.requiredPermission)
  );
}


  getData() {
    this.filterOptions.matterId = this.matterIdentifier;
    this.isLoading = true; 

    this._apiService
      .get(API_Config.matterTimeSheet.get, this.filterOptions)
      .pipe(
        this._unsubscribeService.takeUntilDestroy(),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this.data = res.result.dataList;
            this.totalRecords = res.result.totalCount;
          }
        },
        error: (err) => {
          //console.error('Error fetching timesheet data:', err);
        },
      });
  }

  onSort(event: any): void {
  this.sortField = event.field;
  this.sortOrder = event.order;

  this.filterOptions.orderBy = event.field;
  this.filterOptions.orderByDirection =
    event.order === 1 ? 'ASC' : 'DESC';

  this.filterOptions.pageNum = 1;

  this.getData();
}

  onPageChange(event: PaginatorState): void {
    this.filterOptions.pagSize = Number(event.rows);
    this.filterOptions.pageNum = (event.first ?? 0) / (event.rows ?? 0) + 1;
    this.filterOptions = { ...this.filterOptions };
    this.getData();
  }
  ngOnDestroy(): void {
    this._unsubscribeService.destroy();
  }
}
