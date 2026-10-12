import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedSearchComponent } from 'src/app/@shared/components/shared-search/shared-search.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { FeesDto } from './interfaces/fees.interface';
import { Timesheet_Columns } from './fees-columns.config';
import { FeesFilterComponent } from './fees-editor/components/timesheet-filter/fees-filter.component';
import { DialogService } from 'primeng/dynamicdialog';
import { FeesEditComponent } from './components/fees-edit/fees-edit.component';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';

@Component({
  selector: 'app-fees',
  standalone: true,
  imports: [
    SharedModule,
    SharedSearchComponent,
    SharedButtonComponent,
    SharedTableComponent,
    FeesFilterComponent,
  ],
  templateUrl: './fees.component.html',
  styleUrl: './fees.component.scss',
})
export class FeesComponent implements OnInit, OnDestroy {
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
    typeId: 2,
  };
  data: FeesDto[] = [];
  columns = Timesheet_Columns;
  deleteDialogRef: any;
  isDeleting: boolean = false;

  ngOnInit(): void {
    this.getData();
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

  isLoading: boolean = false;

  onFilter(e: any) {
    console.log('Filter event:', e);

    this.pagination = {
      ...this.pagination,
      matterId: e?.matterId?.value ?? 0,
      taskId: e?.taskId?.value ?? 0,
      lawyerId: e?.lawyerId?.value ?? '',
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
        ([_, v]) => v !== null && v !== undefined && v !== ''
      )
    );
    console.log('Query Params being sent:', queryParams);
    this._apiService
      .get(API_Config.timesheet.getList, queryParams)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.data = res.result?.dataList || [];
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

  searchValue = '';

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
  openTimesheetEdit(rowData: FeesDto) {
    console.log('Opening fees edit with rowData:', rowData);
    const ref = this._dialogService.open(FeesEditComponent, {
      header: 'Edit Fees',
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

  onDelete(rowData: FeesDto) {
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
            'messages.deleteMessage'
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
      }
    );
  }

  deleteRow(id: number) {
    if (!id) {
      this._toastrNotifiService.displayError('Invalid ID for deletion');
      return;
    }

    this.isDeleting = true;
    this._apiService
      .post(`${API_Config.timesheet.deleteList}?id=${id}&typeId=2`, {})
      .pipe(
        finalize(() => (this.isDeleting = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this._toastrNotifiService.displaySuccess(
              res.message || 'Timesheet deleted successfully'
            );
            this.deleteDialogRef.close();
            this.getData();
          } else {
            this._toastrNotifiService.displayError(
              res.message || 'Error deleting timesheet'
            );
          }
        },
        error: (error) => {
          console.error('Delete error:', error);
          this._toastrNotifiService.displayError('Error deleting timesheet');
        },
      });
  }

  onSort(e: any) {
    if (!e || !e.field) {
      return;
    }

    const newOrderBy = e.field;
    const newOrderByDirection = e.order === 1 ? 'ASC' : 'DSC';

    if (
      this.pagination.orderBy === newOrderBy &&
      this.pagination.orderByDirection === newOrderByDirection
    ) {
      return;
    }

    this.pagination = {
      ...this.pagination,
      orderBy: newOrderBy,
      orderByDirection: newOrderByDirection,
      pageNum: 1,
    };
    this.first = 0;

    this.getData();
  }
  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
