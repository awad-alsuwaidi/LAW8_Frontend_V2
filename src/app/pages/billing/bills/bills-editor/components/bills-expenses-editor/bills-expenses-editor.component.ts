import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  Input,
  input,
  InputSignal,
  output,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { finalize, firstValueFrom } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { Bill_Time_Fees_Columns } from './bill-expenses-columns.config';
import { getBillExpensesFormlyField } from './bills-expenses-editor.config';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-bills-expenses-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedTableComponent,
    AccordionModule,
    CommonModule,
    SharedModule,
  ],
  templateUrl: './bills-expenses-editor.component.html',
  styleUrl: './bills-expenses-editor.component.scss',
})
export class BillsExpensesEditorComponent {
  onCalc: any = output();
  @Input() formly!: FormGroup;
  model: InputSignal<any> = input<any>();
  fields: any;
  data: any[] = [];
  isProgrammaticSelection = false;
  defaultSelected: any[] = [];
  isSorting = false;
  totalHours: number = 0;
  totalAmount: number = 0;
    holdsList: any[] = [];
  first!: number;
  isLoading: boolean = false;
  _apiService = inject(ApiService);
  fullTotalAmount: number = 0;
globalSelectedIds: Set<number> = new Set();
allRecords: any[] = [];
  _unsubscribeService = inject(UnsubscribeService);
  ToastrService = inject(ToastrService);
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
  pagination = {
    pagSize: 10,
    pageNum: 1,
    totalElements: 0,
    orderByDirection: 'ASC',
        orderBy: 'date', 

  };

  ngOnInit(): void {
    this.ensureFeesControls();
    this.initForm();
    this.loadHolds();
  }

  loadHolds(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._apiService
        .get('BillingExpenseHold/GetList', {
          pageNum: 1,
          pagSize: 100,
          orderByDirection: 'ASC',
        })
        .pipe(this._unsubscribeService.takeUntilDestroy())
        .subscribe({
          next: (res: any) => {
            if (res?.isSuccess && res.result?.dataList?.length) {
              this.holdsList = res.result.dataList.map((x: any) => ({
                id: x.id,
                nameEn: x.nameEn,
                nameAr: x.nameAr,
              }));
            }
            resolve(); 
          },
          error: (err) => {
            console.error('Error fetching holds:', err);
            reject(err);
          },
        });
    });
  }

  calcTotalAmountAndHours() {
  const selected = this.defaultSelected || [];

  this.globalSelectedIds = new Set(selected.map((r: any) => r.id));

  this.totalHours = selected.reduce(
    (s, x) => s + Number(x.hours || 0),
    0
  );

  this.totalAmount = selected.reduce(
    (s, x) => s + Number(x.amount || 0),
    0
  );

  this.formly.patchValue(
    {
      feesData: selected,
      totalFees: this.totalAmount,
    },
    { emitEvent: false }
  );

  this.emitFeesChange(selected);
}

private ensureFeesControls() {
  if (!this.formly.get('feesData')) {
    this.formly.addControl('feesData', new FormControl([]));
  }

  if (!this.formly.get('totalFees')) {
    this.formly.addControl('totalFees', new FormControl(0));
  }
}

private emitFeesChange(selectedAll: any[]) {
  this.onCalc.emit({
    total: this.totalAmount,
    selected: selectedAll,
  });
}

private syncTotalsFromGlobalSelection() {
  const selectedAll = this.allRecords.filter(r =>
    this.globalSelectedIds.has(r.id)
  );

  this.totalHours = selectedAll.reduce(
    (s, x) => s + Number(x.hours || 0),
    0
  );

  this.totalAmount = selectedAll.reduce(
    (s, x) => s + Number(x.amount || 0),
    0
  );

  this.formly.patchValue(
    {
      feesData: selectedAll,
      totalFees: this.totalAmount,
    },
    { emitEvent: false }
  );

  this.emitFeesChange(selectedAll);
}

  initForm() {
    this.fields = getBillExpensesFormlyField(this);
    if (this.model()) this.defaultSelected = this.model().expensesData;
  }


changePage(event: any) {
  this.pagination = {
    ...this.pagination,
    pageNum: event.page + 1,
    pagSize: event.rows,
  };

  this.loadData();
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

// onSort(e: any) {
//   if (this.isSorting) return;

//   this.isSorting = true;

//   const field = e.field;

//   if (!field) {
//     this.isSorting = false;
//     return;
//   }

//   if (this.pagination.orderBy !== field) {
//     this.pagination.orderBy = field;
//     this.pagination.orderByDirection = 'DESC';
//   } else {
//     this.pagination.orderByDirection =
//       this.pagination.orderByDirection === 'DESC' ? 'ASC' : 'DESC';
//   }

//   this.pagination.pageNum = 1;
//   this.first = 0;

//   this.loadData();
// }

private updateButtonLoadingState() {
  const buttonField = this.fields?.[0]?.fieldGroup?.find(
    (field: any) => field.type === 'button'
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

private buildFilter() {
  const v = this.formly.value;

  const fromDate = v?.FromDate
    ? new Date(v.FromDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const toDate = v?.ToDate
    ? new Date(v.ToDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  return {
    pageNum: this.pagination.pageNum,
    pagSize: this.pagination.pagSize,
    orderBy: this.pagination.orderBy,
    orderByDirection: this.pagination.orderByDirection,
    matterId: Number(v?.law_MatterId),
    fromDate,
    toDate,
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
      .pipe(this._unsubscribeService.takeUntilDestroy())
  );

  this.allRecords = res.result?.dataList || [];

  this.globalSelectedIds = new Set(this.allRecords.map(r => r.id));

  this.syncTotalsFromGlobalSelection();
}

private syncCurrentPageSelection() {
  this.isProgrammaticSelection = true;

  this.defaultSelected = this.data.filter(r =>
    this.globalSelectedIds.has(r.id)
  );

  setTimeout(() => {
    this.isProgrammaticSelection = false;
  });
}

async loadEverything() {
  this.formly.updateValueAndValidity();

  const v = this.formly.value;
  const matterId = Number(v?.law_MatterId);

  if (!matterId || matterId === 0) {
    this.ToastrService.error('Please select a valid matter before loading data.');
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

async loadData(handleLoading: boolean = true): Promise<void> {
  this.formly.updateValueAndValidity();

  const v = this.formly.value;
  const matterId = Number(v?.law_MatterId);

  if (!matterId || matterId === 0) {
    this.ToastrService.error('Please select a valid matter before loading data.');
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
        .pipe(this._unsubscribeService.takeUntilDestroy())
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

onRowSelect(selectedRows: any[]) {
  if (this.isProgrammaticSelection) return;

  const selectedIdsOnCurrentPage = new Set(
    (selectedRows || []).map(row => row.id)
  );

  this.data.forEach(row => {
    if (selectedIdsOnCurrentPage.has(row.id)) {
      this.globalSelectedIds.add(row.id);
    } else {
      this.globalSelectedIds.delete(row.id);
    }
  });

  this.syncCurrentPageSelection();
  this.syncTotalsFromGlobalSelection();
}

calcTotalAmount() {
  this.syncTotalsFromGlobalSelection();
}

}
