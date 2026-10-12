import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  EventEmitter,
  inject,
  Input,
  input,
  InputSignal,
  Output,
  output,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
import { preBillTimeFeesFormlyField } from './pre-bills-time-fees-editor.config';
import { Bill_Time_Fees_Columns } from './pre-bill-time-fees-columns.config';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pre-bill-time-fees-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedTableComponent,
    AccordionModule,
    CommonModule,
    SharedModule,
  ],
  templateUrl: './pre-bill-time-fees-editor.component.html',
  styleUrl: './pre-bill-time-fees-editor.component.scss',
})
export class PreBillTimeFeesEditorComponent {
  @Input() formly!: FormGroup;
@Output() onCalc = new EventEmitter<any>(); 
 model: InputSignal<any> = input<any>();
  fields: any;
  data: any[] = [];
  defaultSelected: any[] = [];
  totalHours: number = 0;
  ToastrService = inject(ToastrService);
  totalAmount: number = 0;
    first!: number;
    fullTotalHours: number = 0;
 fullTotalAmount: number = 0;
 globalSelectedIds: Set<number> = new Set();
allRecords: any[] = [];
isProgrammaticSelection = false;
isSorting = false;
  isLoading: boolean = false;
  _apiService = inject(ApiService);
  _unsubscribeService = inject(UnsubscribeService);
  columns = Bill_Time_Fees_Columns;
  filterOptions?: any = {
    pageNum: 1,
    pagSize: PAGESIZE,
    orderByDirection: 'ASC',
  };
  totalCount = 0;
  pagination = {
  pagSize: 10,
  pageNum: 1,
  totalElements: 0,
  orderByDirection: 'ASC',
  orderBy: 'tmDate', 
};
  @Output() onDataLoaded = new EventEmitter<boolean>();

  signalEffect = effect(() => {
    if (this.model()) {
      this.data = this.model().feesData;
      this.defaultSelected = this.data;
      this.formly.patchValue({
        feesData: this.defaultSelected,
      });
      this.calcTotalAmountAndHours();
    }
  });

  ngOnInit(): void {
    this.ensureFeesControls();
    this.initForm();
  }
  initForm() {
    this.fields = preBillTimeFeesFormlyField(this);
    if (this.model()) this.defaultSelected = this.model().feesData;
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
//   if (!field) return;

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

changePage(event: any) {
  this.pagination = {
    ...this.pagination,
    pageNum: event.page + 1,
    pagSize: event.rows,
  };

  this.loadData();
}
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

  return {
    pageNum: this.pagination.pageNum,
    pagSize: this.pagination.pagSize,
    orderBy: this.pagination.orderBy,
    orderByDirection: this.pagination.orderByDirection,
    matterId: Number(v?.law_MatterId),
    fromDate: new Date(v.timeSheetStartDate).toISOString().split('T')[0],
    toDate: new Date(v.timeSheetEndDate).toISOString().split('T')[0],
    NeverBillFees: v?.NeverBillFees,
    IncludeHoldFees: v?.IncludeHoldFees,
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
      .get(API_Config.billFeesList.get, fullFilter)
      .pipe(this._unsubscribeService.takeUntilDestroy())
  );

  this.allRecords = res.result?.dataList || [];

  this.globalSelectedIds = new Set(this.allRecords.map(r => r.id));

  this.syncTotalsFromGlobalSelection();
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

  if (!v?.timeSheetStartDate || !v?.timeSheetEndDate) {
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


async loadData(handleLoading: boolean = true): Promise<void> {
  this.formly.updateValueAndValidity();

  const v = this.formly.value;
  const matterId = Number(v?.law_MatterId);

  if (!matterId || matterId === 0) {
    this.ToastrService.error('Please select a valid matter before loading data.');
    return;
  }

  if (!v?.timeSheetStartDate || !v?.timeSheetEndDate) {
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
        .get(API_Config.billFeesList.get, this.filterOptions)
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
calcCurrentPageTotals() {
  const selected = this.defaultSelected;

  this.totalHours = selected.reduce((s, x) => s + Number(x.hours || 0), 0);
  this.totalAmount = selected.reduce((s, x) => s + Number(x.amount || 0), 0);

  this.formly.patchValue(
    {
      feesData: selected,
      totalFees: this.totalAmount,
    },
    { emitEvent: false }
  );

  this.emitFeesChange(selected);
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


// private loadAllTotals() {
//   const fullFilter = {
//     ...this.filterOptions,
//     pageNum: 1,
//     pagSize: 999999,
//   };

//   this._apiService
//     .get(API_Config.billFeesList.get, fullFilter)
//     .pipe(this._unsubscribeService.takeUntilDestroy())
//     .subscribe({
//       next: (res: ApiRes) => {
//         this.allRecords = res.result?.dataList || [];
//         this.fullTotalHours = this.allRecords.reduce((s, x) => s + (x.hours || 0), 0);
//         this.fullTotalAmount = this.allRecords.reduce((s, x) => s + Number(x.amount || 0), 0);
//         this.globalSelectedIds = new Set(this.allRecords.map(r => r.id));
//         this.totalHours = this.fullTotalHours;
//         this.totalAmount = this.fullTotalAmount;
//         this.onCalc.emit(this.totalAmount);

//         this.formly.patchValue({
//           feesData: this.allRecords
//         });
//         this.defaultSelected = this.data.filter(r => this.globalSelectedIds.has(r.id));
//       },
//     });
// }

// onRowSelect(selectedRows: any[]) {
//   const currentPageIds = this.data.map(d => d.id);
//   currentPageIds.forEach(id => this.globalSelectedIds.delete(id));
//   selectedRows.forEach(row => this.globalSelectedIds.add(row.id));
//   const selectedAll = this.allRecords.filter(r => this.globalSelectedIds.has(r.id));
//   this.totalHours = selectedAll.reduce((sum, item) => sum + (item.hours || 0), 0);
//   this.totalAmount = selectedAll.reduce((sum, item) => sum + Number(item.amount || 0), 0);
//   this.onCalc.emit(this.totalAmount);

//   this.formly.patchValue({
//     feesData: selectedAll
//   });
//   this.defaultSelected = this.data.filter(r => this.globalSelectedIds.has(r.id));
// }
calcTotalAmountAndHours() {
  const selected = this.defaultSelected || [];

  this.totalHours = selected.reduce(
    (accumulator, obj) => accumulator + Number(obj.hours || 0),
    0
  );

  this.totalAmount = selected.reduce(
    (accumulator, obj) => accumulator + Number(obj.amount || 0),
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
private ensureFeesControls() {
  if (!this.formly.get('feesData')) {
    this.formly.addControl('feesData', new FormControl([]));
  }

  if (!this.formly.get('totalFees')) {
    this.formly.addControl('totalFees', new FormControl(0));
  }
}

private emitFeesChange(selectedAll: any[]) {
  console.log('CHILD SELECTED FEES =>', selectedAll);

  this.onCalc.emit({
    total: this.totalAmount,
    selected: selectedAll,
  });
}

}
