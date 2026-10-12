import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  input,
  Input,
  InputSignal,
  output,
} from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { finalize, firstValueFrom } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { getQuickBillExpensesFormlyField } from './quick-bill-expenses-editor.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { FormGroup } from '@angular/forms';
import { ApiService } from 'src/app/@core/api/api.service';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { Quick_Bill_Time_Fees_Columns } from './quick-bill-expenses-columns.config';
import { DialogService } from 'primeng/dynamicdialog';
import { ExpensesEditorComponent } from 'src/app/pages/accounts/expenses/expenses-editor/expenses-editor.component';
import { QuickBillCreateExpensesEditorComponent } from './components/quick-bill-create-expenses-editor/quick-bill-create-expenses-editor.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-quick-bill-expenses-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedTableComponent,
    AccordionModule,
    CommonModule,
    SharedModule,
  ],
  templateUrl: './quick-bill-expenses-editor.component.html',
  styleUrl: './quick-bill-expenses-editor.component.scss',
})
export class QuickBillExpensesEditorComponent {
  onCalc: any = output();
  @Input() formly!: FormGroup;
  model: InputSignal<any> = input<any>();
  fields: any;
  fullTotalAmount: number = 0;
  globalSelectedIds: Set<number> = new Set();
  allRecords: any[] = [];
  isProgrammaticSelection = false;
  data: any[] = [];
  isSorting = false;
  defaultSelected: any[] = [];
  totalHours: number = 0;
  totalAmount: number = 0;
  isLoading: boolean = false;
  first!: number;
  _apiService = inject(ApiService);
  _unsubscribeService = inject(UnsubscribeService);
  _dialogService = inject(DialogService);
  @Input() matter!: number;
  ToastrService = inject(ToastrService);

  columns = Quick_Bill_Time_Fees_Columns;

  filterOptions?: any = {
    pageNum: 1,
    pagSize: PAGESIZE,
    orderByDirection: 'ASC',
  };
  pagination = {
    pagSize: 10,
    pageNum: 1,
    totalElements: 0,
    orderByDirection: 'ASC',
    orderBy: 'date',
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

  ngOnInit(): void {
    this.initForm();
    this.loadHolds();
  }

  changePage(event: any) {
    this.pagination = {
      ...this.pagination,
      pageNum: event.page + 1,
      pagSize: event.rows,
    };

    this.applyClientPagination();
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

  private buildFilter() {
    const fromDateValue = this.formly.get('FromDate')?.value;
    const toDateValue = this.formly.get('ToDate')?.value;
    const matterId = Number(this.formly.get('law_MatterId')?.value);

    return {
      MatterId: matterId,
      FromDate: new Date(fromDateValue).toISOString().split('T')[0],
      ToDate: new Date(toDateValue).toISOString().split('T')[0],
      NeverBill: this.formly.get('NeverBill')?.value,
      IncludeHold: this.formly.get('IncludeHold')?.value,
      pagSize: 999999,
      pageNum: 1,

      orderBy: this.pagination.orderBy,
      orderByDirection: this.pagination.orderByDirection,
    };
  }

  onSort(e: any) {
  this.pagination = {
    ...this.pagination,
    orderBy: e.field,
    orderByDirection: e.order === 1 ? 'ASC' : 'DESC',
    pageNum: 1,
  };

  this.first = 0;

  this.loadEverything();
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
  //   this.loadEverything();
  // }

  private extractRows(res: ApiRes): any[] {
    const result: any = res.result;

    if (Array.isArray(result)) {
      return result;
    }

    return result?.dataList || [];
  }

  private mapExpenseRows(rows: any[]) {
    return (rows || []).map((item: any) => {
      const row = { ...item };

      const hold = this.holdsList.find((h: any) => h.id === row.holdId);

      if (hold) {
        const lang = localStorage.getItem('law8-LocalStore.lang') ?? 'en';

        row.holdId =
          lang === 'ar'
            ? hold.nameAr || hold.nameEn
            : hold.nameEn || hold.nameAr;
      }

      return row;
    });
  }

  private sortAllRecords() {
    const field = this.pagination.orderBy;
    const direction = this.pagination.orderByDirection;

    this.allRecords = [...this.allRecords].sort((a, b) => {
      const valueA = a?.[field];
      const valueB = b?.[field];

      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return direction === 'ASC' ? -1 : 1;
      if (valueB == null) return direction === 'ASC' ? 1 : -1;

      const dateA = Date.parse(valueA);
      const dateB = Date.parse(valueB);

      if (!isNaN(dateA) && !isNaN(dateB)) {
        return direction === 'ASC' ? dateA - dateB : dateB - dateA;
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return direction === 'ASC' ? valueA - valueB : valueB - valueA;
      }

      return direction === 'ASC'
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
  }

  private applyClientPagination() {
    const start = (this.pagination.pageNum - 1) * this.pagination.pagSize;
    const end = start + this.pagination.pagSize;

    this.data = this.allRecords.slice(start, end);

    this.pagination = {
      ...this.pagination,
      totalElements: this.allRecords.length,
    };

    this.syncCurrentPageSelection();
    this.syncTotalsFromGlobalSelection();
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

    this.onCalc.emit(this.totalAmount);
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

  async loadEverything() {
    this.formly.updateValueAndValidity();
    const fromDateValue = this.formly.get('FromDate')?.value;
    const toDateValue = this.formly.get('ToDate')?.value;
    const matterId = Number(this.formly.get('law_MatterId')?.value);
    if (!matterId || matterId === 0) {
      this.ToastrService.error(
        'Please select a valid matter before loading data.',
      );
      return;
    }
    if (!fromDateValue || !toDateValue) {
      this.ToastrService.error('Please select both start and end dates.');
      return;
    }
    this.pagination = { ...this.pagination, pageNum: 1 };
    this.first = 0;
    this.filterOptions = this.buildFilter();
    const oldSelectedIds =
      this.allRecords.length > 0 ? new Set(this.globalSelectedIds) : null;

    this.isLoading = true;
    this.updateButtonLoadingState();

    try {
      const res: ApiRes = await firstValueFrom(
        this._apiService
          .get(API_Config.quickBill.getMatterExpensesList, this.filterOptions)
          .pipe(this._unsubscribeService.takeUntilDestroy()),
      );

      const rows = this.extractRows(res);
      this.allRecords = this.mapExpenseRows(rows);

      if (oldSelectedIds) {
        const newAllIds = new Set(this.allRecords.map((r) => r.id));
        this.globalSelectedIds = new Set(
          [...oldSelectedIds].filter((id) => newAllIds.has(id)),
        );
      } else {
        this.globalSelectedIds = new Set(this.allRecords.map((r) => r.id));
      }

      this.sortAllRecords();
      this.applyClientPagination();
    } finally {
      this.isLoading = false;
      this.isSorting = false;
      this.updateButtonLoadingState();
    }
  }

  loadData() {
    if (!this.allRecords.length) {
      this.loadEverything();
      return;
    }

    this.applyClientPagination();
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

  calcTotalAmount() {
    this.syncTotalsFromGlobalSelection();
  }

  openExpensesEditor() {
    const matterId = Number(this.formly.get('law_MatterId')?.value);

    if (!matterId || matterId === 0) {
      this.ToastrService.error('Please select a valid matter first.');
      return;
    }

    const ref = this._dialogService.open(
      QuickBillCreateExpensesEditorComponent,
      {
        styleClass: 'w-3/5',
        header: 'Add New Expenses',
        data: {
          matter: matterId,
        },
      },
    );

    ref.onClose.pipe(this._unsubscribeService.takeUntilDestroy()).subscribe({
      next: (res) => {
        if (res) this.loadEverything();
      },
    });
  }

  loadHolds() {
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
        },
        error: (err) => console.error('Error fetching holds:', err),
      });
  }
  holdsList: any[] = [];
  initForm() {
    this.fields = getQuickBillExpensesFormlyField(this);
    this.fields[0].options = {
      formState: {
        matter: this.matter,
      },
    };

    if (this.model()) this.defaultSelected = this.model().expensesData;
  }
}
