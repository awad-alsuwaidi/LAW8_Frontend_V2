import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  Input,
  input,
  InputSignal,
  output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { finalize, firstValueFrom } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { getPreBillExpensesFormlyField } from './pre-bills-expenses-editor.config';
import { Bill_Time_Fees_Columns } from './pre-bill-expenses-columns.config';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pre-bill-expenses-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedTableComponent,
    AccordionModule,
    CommonModule,
    SharedModule,
  ],
  templateUrl: './pre-bill-expenses-editor.component.html',
  styleUrl: './pre-bill-expenses-editor.component.scss',
})
export class PreBillExpensesEditorComponent {
  onCalc: any = output();
  @Input() formly!: FormGroup;
  model: InputSignal<any> = input<any>();
  fields: any;
  data: any[] = [];
  defaultSelected: any[] = [];
  totalHours: number = 0;
  totalAmount: number = 0;
  fullTotalAmount: number = 0;
  isProgrammaticSelection = false;
  globalSelectedIds: Set<number> = new Set();
  allRecords: any[] = [];
  first!: number;
  isLoading: boolean = false;
  _apiService = inject(ApiService);
  _unsubscribeService = inject(UnsubscribeService);
  ToastrService = inject(ToastrService);
  isSorting = false;

  columns = Bill_Time_Fees_Columns;
  filterOptions?: any = {
    pageNum: 1,
    pagSize: PAGESIZE,
    orderByDirection: 'ASC',
  };
  signalEffect = effect(() => {
    if (this.model()) {
      this.data = this.model().expensesData;
      this.defaultSelected = this.data;
      this.formly.patchValue({
        expensesData: this.defaultSelected,
      });
      this.calcTotalAmount();
    }
  });
  changePage(event: any) {
    this.pagination = {
      ...this.pagination,
      pageNum: event.page + 1,
      pagSize: event.rows,
    };

    this.loadData();
  }

  pagination = {
    pagSize: 10,
    pageNum: 1,
    totalElements: 0,
    orderByDirection: 'ASC',
    orderBy: 'date',
  };

  ngOnInit(): void {
    this.initForm();
  }
  initForm() {
    this.fields = getPreBillExpensesFormlyField(this);
    if (this.model()) this.defaultSelected = this.model().expensesData;
  }

  onSort(e: any) {
    if (this.isSorting) return;

    this.isSorting = true;

    this.pagination = {
      ...this.pagination,
      orderBy: e.field,
      orderByDirection: e.order === 1 ? 'ASC' : 'DESC',
      pageNum: 1,
    };

    this.first = 0;

    this.loadData();
  }

  private buildFilter() {
    const v = this.formly.value;

    return {
      pageNum: this.pagination.pageNum,
      pagSize: this.pagination.pagSize,
      orderBy: this.pagination.orderBy,
      orderByDirection: this.pagination.orderByDirection,
      matterId: Number(v?.law_MatterId),
      fromDate: new Date(v.ExpFromDate).toISOString().split('T')[0],
      toDate: new Date(v.ExpToDate).toISOString().split('T')[0],
      NeverBillExpenses: v?.NeverBillExpenses,
      IncludeHoldExpenses: v?.IncludeHoldExpenses,
    };
  }

  async loadAllTotals(): Promise<void> {
    const fullFilter = {
      ...this.filterOptions,
      pageNum: 1,
      pagSize: 999999,
    };

    const res: ApiRes = await firstValueFrom(
      this._apiService
        .get(API_Config.billExpensesList.get, fullFilter)
        .pipe(this._unsubscribeService.takeUntilDestroy()),
    );

    this.allRecords = res.result?.dataList || [];

    this.globalSelectedIds = new Set(this.allRecords.map((r) => r.id));

    this.syncTotalsFromGlobalSelection();
  }

  private syncCurrentPageSelection() {
    this.isProgrammaticSelection = true;

    this.defaultSelected = this.data.filter((r) =>
      this.globalSelectedIds.has(r.id),
    );

    setTimeout(() => {
      this.isProgrammaticSelection = false;
    });
  }

  async loadData(handleLoading: boolean = true): Promise<void> {
    this.formly.updateValueAndValidity();

    const v = this.formly.value;
    const matterId = Number(v?.law_MatterId);

    if (!matterId || matterId === 0) {
      this.ToastrService.error('Please select a valid matter.');
      return;
    }

    if (!v?.ExpFromDate || !v?.ExpToDate) {
      this.ToastrService.error('Please select both start and end dates.');
      return;
    }

    this.filterOptions = {
      ...this.buildFilter(),
      pageNum: this.pagination.pageNum,
      pagSize: this.pagination.pagSize,
    };

    if (handleLoading) {
      this.isLoading = true;
      this.updateButtonLoadingState();
    }

    try {
      const res: ApiRes = await firstValueFrom(
        this._apiService
          .get(API_Config.billExpensesList.get, this.filterOptions)
          .pipe(this._unsubscribeService.takeUntilDestroy()),
      );

      this.data = res.result?.dataList || [];

      this.pagination = {
        ...this.pagination,
        totalElements: res.result?.totalCount || 0,
      };

      this.syncCurrentPageSelection();
      this.syncTotalsFromGlobalSelection();
    } finally {
      if (handleLoading) {
        this.isLoading = false;
        this.updateButtonLoadingState();
      }

      this.isSorting = false;
    }
  }

  async loadEverything() {
    this.formly.updateValueAndValidity();

    const v = this.formly.value;
    const matterId = Number(v?.law_MatterId);

    if (!matterId || matterId === 0) {
      this.ToastrService.error('Please select a valid matter.');
      return;
    }

    if (!v?.ExpFromDate || !v?.ExpToDate) {
      this.ToastrService.error('Please select both start and end dates.');
      return;
    }

    this.pagination = {
      ...this.pagination,
      pageNum: 1,
    };

    this.first = 0;

    this.filterOptions = this.buildFilter();

    this.globalSelectedIds.clear();
    this.allRecords = [];
    this.defaultSelected = [];

    this.isLoading = true;
    this.updateButtonLoadingState();

    try {
      await this.loadAllTotals();
      await this.loadData(false);
    } finally {
      this.isLoading = false;
      this.updateButtonLoadingState();
    }
  }

  onRowSelect(selectedRows: any[]) {
    if (this.isProgrammaticSelection) return;

    const selectedIdsOnCurrentPage = new Set(
      (selectedRows || []).map((row) => row.id),
    );

    this.data.forEach((row) => {
      if (selectedIdsOnCurrentPage.has(row.id)) {
        this.globalSelectedIds.add(row.id);
      } else {
        this.globalSelectedIds.delete(row.id);
      }
    });

    this.syncCurrentPageSelection();
    this.syncTotalsFromGlobalSelection();
  }

  private emitExpensesChange(selectedAll: any[]) {
    this.onCalc.emit({
      total: this.totalAmount,
      selected: selectedAll,
    });
  }

  private syncTotalsFromGlobalSelection() {
    const selectedAll = this.allRecords.filter((r) =>
      this.globalSelectedIds.has(r.id),
    );

    this.totalAmount = selectedAll.reduce(
      (s, x) => s + Number(x.amount || 0),
      0,
    );

    this.formly.patchValue(
      {
        expensesData: selectedAll,
        totalExpenses: this.totalAmount,
      },
      { emitEvent: false },
    );

    this.emitExpensesChange(selectedAll);
  }
  private updateButtonLoadingState() {
    const buttonField = this.fields?.[0]?.fieldGroup?.find(
      (field: any) => field.type === 'button',
    );

    if (buttonField) {
      buttonField.props = {
        ...buttonField.props,
        isLoading: this.isLoading,
        disabled: this.isLoading,
      };

      this.fields = [...this.fields];
    }
  }

  // onRowSelect(e: any) {
  //   this.defaultSelected = e;
  //   this.calcTotalAmount();
  // }

  calcTotalAmount() {
    const selected = this.defaultSelected || [];

    this.totalAmount = selected.reduce(
      (accumulator, obj) => accumulator + Number(obj.amount || 0),
      0,
    );

    this.formly.patchValue(
      {
        expensesData: selected,
        totalExpenses: this.totalAmount,
      },
      { emitEvent: false },
    );

    this.emitExpensesChange(selected);
  }
}
