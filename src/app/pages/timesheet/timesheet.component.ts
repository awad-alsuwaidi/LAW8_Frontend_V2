import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { finalize, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedSearchComponent } from 'src/app/@shared/components/shared-search/shared-search.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { Timesheet_Columns } from './timesheet-columns.config';
import { TimesheetFilterComponent } from './timesheet-editor/components/timesheet-filter/timesheet-filter.component';
import { DialogService } from 'primeng/dynamicdialog';
import { TimesheetEditComponent } from './components/timesheet-edit/timesheet-edit.component';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { TooltipModule } from 'primeng/tooltip';
import { TimesheetListItemDto } from './interfaces/timesheet.interface';

@Component({
  selector: 'app-timesheet',
  standalone: true,
  imports: [
    SharedModule,
    SharedSearchComponent,
    SharedButtonComponent,
    SharedTableComponent,
    TimesheetFilterComponent,
    TooltipModule,
  ],
  templateUrl: './timesheet.component.html',
  styleUrl: './timesheet.component.scss',
})
export class TimesheetComponent implements OnInit, OnDestroy {
  protected _router = inject(Router);
  protected _route = inject(ActivatedRoute);
  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _dialogService = inject(DialogService);
  private _languageService = inject(LanguageService);
  private _toastrNotifiService = inject(ToastrNotifiService);

  data: TimesheetListItemDto[] = [];
  columns = Timesheet_Columns;
  deleteDialogRef: any;
  isDeleting = false;
  isLoading = false;
  canViewRates = true;

  protected pagination: any = {
    PageNumber: 1,
    PageSize: PAGESIZE,
    SortBy: 'date',
    IsDescending: false,
    searchTerm: '',
    filters: {} as any,
  };

  private search$ = new Subject<string>();

  ngOnInit(): void {
    this.search$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe((term) => {
        this.pagination.searchTerm = term || '';
        this.pagination.PageNumber = 1;
        this.getData();
      });

    this.getData();
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }

  private buildQueryString(): string {
    const flat: Record<string, any> = {
      PageNumber: this.pagination.PageNumber,
      PageSize: this.pagination.PageSize,
      SortBy: this.pagination.SortBy,
      IsDescending: this.pagination.IsDescending,
    };
    if (this.pagination.searchTerm)
      flat['searchTerm'] = this.pagination.searchTerm;

    Object.entries(this.pagination.filters ?? {}).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      if (Array.isArray(v) && !v.length) return;
      flat[`filters[${k}]`] = Array.isArray(v) ? v.join(',') : v;
    });

    return Object.entries(flat)
      .map(
        ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
      )
      .join('&');
  }

  openTimesheetEdit(rowData: TimesheetListItemDto): void {
    const ref = this._dialogService.open(TimesheetEditComponent, {
      header: 'Edit Timesheet',
      width: '50vw',
      modal: true,
      dismissableMask: true,
      data: { ...rowData },
    });

    ref.onClose.subscribe((result: any) => {
      if (result?.success) {
        this.getData();
      }
    });
  }

  getData(): void {
    this.isLoading = true;
    const qs = this.buildQueryString();

    this._apiService
      .get(`${API_Config.timesheet.list}?${qs}`)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success || res?.isSuccess;
          if (!isSuccess) return;

          const responseData = res.data || res.result;
          const items = responseData?.items || responseData?.dataList || [];
          const totalCount = responseData?.totalCount || 0;

          this.data = items.map((it: any, i: number) => ({
            ...it,
            serial:
              i +
              1 +
              (this.pagination.PageNumber - 1) * this.pagination.PageSize,
          }));

          this.canViewRates = this.data.some(
            (r) => r.rateAmount !== null && r.rateAmount !== undefined,
          );
          this.pagination.totalElements = totalCount;
        },
      });
  }

  searchValueChange(value: string): void {
    this.search$.next(value);
  }

  onPageChange(e: any): void {
    this.pagination.PageNumber = e.first / e.rows + 1;
    this.pagination.PageSize = Number(e.rows);
    this.getData();
  }

  onSort(e: any): void {
    if (!e?.field) return;

    if (this.pagination.SortBy !== e.field) {
      this.pagination.SortBy = e.field;
      this.pagination.IsDescending = true;
    } else {
      this.pagination.IsDescending = !this.pagination.IsDescending;
    }

    this.pagination.PageNumber = 1;
    this.getData();
  }

  onFilter(e: any): void {
    const f: any = {};
    if (e?.matterId?.value) f.matterId = e.matterId.value;
    if (e?.taskId?.value) f.taskCodeId = e.taskId.value;
    if (e?.rateId?.value) f.rateId = e.rateId.value;
    if (e?.statusCode) f.statusCode = e.statusCode;

    if (e?.isBillable !== undefined && e?.isBillable !== null) {
      f.isBillable = e.isBillable;
    }

    if (e?.hold) f.hold = e.hold;

    if (e?.fromDate) {
      f.dateFrom = new Date(e.fromDate).toISOString().split('T')[0];
    }

    if (e?.toDate) {
      f.dateTo = new Date(e.toDate).toISOString().split('T')[0];
    }

    if (Array.isArray(e?.lawyerId) && e.lawyerId.length) {
      f.userId = e.lawyerId
        .map((x: any) => (typeof x === 'object' ? x.id : x))
        .join(',');
    } else if (e?.lawyerId === 'all') {
      f.userId = 'all';
    }

    this.pagination.filters = f;
    this.pagination.searchTerm = e?.search?.trim() || '';

    this.pagination.PageNumber = 1;

    this.getData();
  }

  canEditOrDelete(row: TimesheetListItemDto): boolean {
    return !!(row as any)?.canEdit;
  }
  
  getTaskClass(task: string): string {
    switch (task) {
      case 'Billable':
        return 'bg-green-100 text-green-700';

      case 'Non-Billable':
        return 'bg-gray-200 text-gray-700';

      case 'No-Charge':
        return 'bg-yellow-100 text-yellow-600';

      case 'Research':
        return 'bg-blue-100 text-blue-700';

      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  onDelete(rowData: TimesheetListItemDto): void {
    this.deleteDialogRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        modal: true,
        styleClass: 'w-[400px]',
        data: {
          type: ConfirmDialogType.Danger,
          title: this._languageService.getTransValue('messages.deleteTitle', {
            value: rowData?.id,
          }),
          message: this._languageService.getTransValue(
            'messages.deleteMessage',
          ),
          btns: [
            {
              label: this._languageService.getTransValue('lookups.discard'),
              styleClass: 'border border-grey500 text-grey500',
              command: () => this.deleteDialogRef.close(),
            },
            {
              label: this.isDeleting
                ? 'Deleting...'
                : this._languageService.getTransValue('lookups.delete'),
              styleClass: 'bg-textErrorBase text-white',
              disabled: this.isDeleting,
              command: () => this.deleteRow(rowData?.id),
            },
          ],
        },
      },
    );
  }

  deleteRow(id: number): void {
    if (!id) return;
    this.isDeleting = true;
    this._apiService
      .delete(`${API_Config.timesheet.list}/${id}`)
      .pipe(
        finalize(() => (this.isDeleting = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this._toastrNotifiService.displaySuccess(res.message || 'Deleted');
            this.deleteDialogRef.close();
            this.getData();
          } else {
            this._toastrNotifiService.displayError(
              res.message || 'Error deleting',
            );
          }
        },
      });
  }
}
