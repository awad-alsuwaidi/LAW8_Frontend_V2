import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, finalize } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedSearchComponent } from 'src/app/@shared/components/shared-search/shared-search.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { TimesheetDto } from './interfaces/timesheet.interface';
import { Timesheet_Columns } from './timesheet-columns.config';
import { TimesheetFilterComponent } from './timesheet-editor/components/timesheet-filter/timesheet-filter.component';
import { DialogService } from 'primeng/dynamicdialog';
import { TimesheetEditComponent } from './components/timesheet-edit/timesheet-edit.component';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { TooltipModule } from 'primeng/tooltip';

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
  protected first!: number;

  protected pagination: any = {
    pagSize: PAGESIZE,
    pageNum: 1,
    orderByDirection: 'ASC',
    orderBy: 'tmDate',
  };

  data: TimesheetDto[] = [];
  columns = Timesheet_Columns;
  deleteDialogRef: any;
  isDeleting: boolean = false;
  lookupsData: any = {};
  isLoading: boolean = false;
  searchValue = '';

  ngOnInit(): void {
    this.getLookups();
    this.getData();
  }

  getLookups(): void {
    combineLatest({
      lawyers: this._apiService.get(
        API_Config.general.getUsersInitialViewForTimeShet,
      ),
      tasks: this._apiService.get(API_Config.general.getTaskCode),
      matterCode: this._apiService.get(API_Config.general.getMatterCodes),
    })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((res) => {
        this.lookupsData = res;
      });
  }


  searchValueChange(value: string): void {
    this.pagination = {
      ...this.pagination,
      search: value,
      pageNum: 1,
    };
    this.getData();
  }

  onPageChange(e: any) {
    this.pagination = {
      ...this.pagination,
      pagSize: Number(e.rows),
      pageNum: e.first / e.rows + 1,
    };
    this.getData();
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

  private getRepeatedParams(args: any): string {
    if (!args) return '';

    const params: string[] = [];

    Object.keys(args).forEach((key) => {
      const value = args[key];

      if (value == null) return;

      if (Array.isArray(value)) {
        value.forEach((item) => {
          params.push(`${key}=${item}`);
        });
      } else {
        params.push(`${key}=${value}`);
      }
    });

    return params.length ? `?${params.join('&')}` : '';
  }

  onFilter(e: any) {
    console.log('Filter event:', e);

    this.pagination = {
      ...this.pagination,
      matterId: e?.matterId?.value ?? 0,
      taskId: e?.taskId?.value ?? 0,
      lawyerId: Array.isArray(e?.lawyerId)
        ? e.lawyerId.map((item: any) =>
            typeof item === 'object' ? item.id : item,
          )
        : [],
      fromDate: e?.fromDate
        ? new Date(e.fromDate).toISOString().split('T')[0]
        : '',
      toDate: e?.toDate ? new Date(e.toDate).toISOString().split('T')[0] : '',
      search: e?.search ?? '',
      pageNum: 1,
    };

    console.log('Pagination after filter:', this.pagination);

    this.getData();
  }


  getData(): void {
    console.log('getData called with pagination:', this.pagination);
    console.log('API endpoint:', API_Config.timesheet.getList);

    this.isLoading = true;
    const queryParams = Object.fromEntries(
      Object.entries(this.pagination).filter(
        ([_, v]) => v !== null && v !== undefined && v !== '',
      ),
    );

    console.log('Query Params being sent:', queryParams);

    this._apiService;
    const queryString = this.getRepeatedParams(queryParams);

    this._apiService
      .get(API_Config.timesheet.getList + queryString)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            // this.data = res.result?.dataList || [];
            this.data = (res.result?.dataList || []).map(
              (item: any, index: number) => ({
                ...item,
                serial:
                  index +
                  1 +
                  (this.pagination.pageNum - 1) * this.pagination.pagSize,
              }),
            );
            console.log('Timesheet data loaded:', this.data);
            this.pagination.totalElements = res.result?.totalCount;
            this.pagination = { ...this.pagination };
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('API error:', error);
          this.isLoading = false;
        },
      });
  }

  // onFilter(e: any) {
  //   this.searchValue = e?.search || '';

  //   this.pagination = {
  //     ...this.pagination,
  //     FromDate: e?.FromDate,
  //     ToDate: e?.ToDate,
  //     lawyerId: e?.lawyerId?.value,
  //     taskId: e?.taskId?.value,
  //     matterId: e?.matterId?.value,
  //     search: this.searchValue,
  //     pageNum: 1,
  //   };

  //   console.log('Search Value Changed:', this.searchValue);
  //   this.getData();
  // }
  openTimesheetEdit(rowData: TimesheetDto) {
    console.log('Opening timesheet edit with rowData:', rowData);
    const ref = this._dialogService.open(TimesheetEditComponent, {
      header: 'Edit Timesheet',
      width: '45vw',
      data: rowData,
    });

    ref.onClose.subscribe({
      next: (result) => {
        if (result) {
          console.log('Timesheet updated, refreshing data');
          this.getData();
        }
      },
    });
  }
  canEditOrDelete(row: TimesheetDto): boolean {
    return !row?.invoiceNo;
  }

  onDelete(rowData: TimesheetDto) {
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
              command: () => {
                this.deleteDialogRef.close();
              },
            },
            {
              label: this.isDeleting
                ? 'Deleting...'
                : this._languageService.getTransValue('lookups.delete'),
              styleClass: 'bg-textErrorBase text-white',
              disabled: this.isDeleting,
              command: () => {
                this.deleteRow(rowData?.id);
              },
            },
          ],
        },
      },
    );
  }

  deleteRow(id: number) {
    if (!id) {
      this._toastrNotifiService.displayError('Invalid ID for deletion');
      return;
    }

    this.isDeleting = true;
    this._apiService
      .post(`${API_Config.timesheet.deleteList}?id=${id}`, {})
      .pipe(
        finalize(() => (this.isDeleting = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this._toastrNotifiService.displaySuccess(
              res.message || 'Timesheet deleted successfully',
            );
            this.deleteDialogRef.close();
            this.getData();
          } else {
            this._toastrNotifiService.displayError(
              res.message || 'Error deleting timesheet',
            );
          }
        },
        error: (error) => {
          console.error('Delete error:', error);
          this._toastrNotifiService.displayError('Error deleting timesheet');
        },
      });
  }

  //   onSort(e: any) {
  //     if (!e || !e.field) {
  //       return;
  //     }

  //     const newOrderBy = e.field;
  // const newOrderByDirection = e.order === 1 ? 'ASC' : 'DESC';

  //     if (
  //       this.pagination.orderBy === newOrderBy &&
  //       this.pagination.orderByDirection === newOrderByDirection
  //     ) {
  //       return;
  //     }

  //     this.pagination = {
  //       ...this.pagination,
  //       orderBy: newOrderBy,
  //       orderByDirection: newOrderByDirection,
  //       pageNum: 1,
  //     };
  //     this.first = 0;

  //     this.getData();
  //   }

  onSort(e: any) {
    const field = e.field;
    if (!field) return;
    if (this.pagination.orderBy !== field) {
      this.pagination.orderBy = field;
      this.pagination.orderByDirection = 'DESC';
    } else {
      this.pagination.orderByDirection =
        this.pagination.orderByDirection === 'DESC' ? 'ASC' : 'DESC';
    }
    console.log(
      'Sorting:',
      this.pagination.orderBy,
      this.pagination.orderByDirection,
    );
    this.pagination.pageNum = 1;
    this.first = 0;
    this.getData();
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
