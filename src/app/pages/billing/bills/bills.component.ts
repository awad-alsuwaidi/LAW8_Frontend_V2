import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { TableModule } from 'primeng/table';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { Bill_Columns, Bill_List_Columns } from './bill-columns.config';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { BillsFilterEditorComponent } from '../components/bills-filter-editor/bills-filter-editor.component';
import { EmptyConfig } from 'src/app/@shared/components/shared-empty-section/interface/empty-config.interface';
import { SharedEmptySectionComponent } from 'src/app/@shared/components/shared-empty-section/shared-empty-section.component';
import { finalize } from 'rxjs';
import { ApplyDiscountDialogComponent } from './apply-discount/apply-discount-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { RecreateBillDialogComponent } from './recreate-bill-dialog.component';

@Component({
  selector: 'app-bills',
  standalone: true,
  imports: [
    SharedModule,
    SharedButtonComponent,
    BillsFilterEditorComponent,
    TableModule,
    PaginatorModule,
    MenuModule,
    SharedTableComponent,
    SharedEmptySectionComponent,
  ],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.scss',
})
export class BillsComponent implements OnInit, OnDestroy {
  _router = inject(Router);
  _languageService = inject(LanguageService);
  _unsubscribeService = inject(UnsubscribeService);
  _apiService = inject(ApiService);

  menuItems: MenuItem[] = [];
  selectedRow: any;
  deleteDialogRef: any;
  filterOptions: any = {
    pageNum: 1,
    pagSize: 10,
    orderBy: null, 
    orderByDirection: 'ASC',
  };
  emptyConfig: EmptyConfig = {
    addPermission: '',
    messageTitle: 'Load Data First',
    description:
      'Please select the billing period and relevant filters, then click "Load" to view your customized billing list.',
  };
  data: any[] = [];
  totalRecords: number = 0;
  columns: any[] = [];
    isLoading = false;
  selectedView = signal<string>('card');
 _dialogService = inject(DialogService);             
  _toastrNotifiService = inject(ToastrNotifiService);  
  sortField = '';
  sortOrder = 1;

  ngOnInit(): void {
    this.updateColumnsBasedOnView();
  }
  updateColumnsBasedOnView() {
    this.columns =
      this.selectedView() == 'card'
        ? [...Bill_Columns]
        : [...Bill_List_Columns];
  }
  getData() {
    this.isLoading=true;
    this._apiService
      .get(API_Config.bill.get, this.filterOptions)
      .pipe(
                finalize(() => (this.isLoading = false)),  
        this._unsubscribeService.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this.data = res.result.dataList;
            this.totalRecords = res.result.totalCount;
            this.setMenuItems();
          }
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

applyDiscount(billId: number) {
  this._apiService
    .get(API_Config.bill.getById + '?id=' + billId)
    .pipe(this._unsubscribeService.takeUntilDestroy())
    .subscribe({
      next: (res: ApiRes) => {
        if (res.isSuccess) {
          const billData = res.result;

          const ref = this._dialogService.open(ApplyDiscountDialogComponent, {
            header: 'Apply Discount',
            width: '45vw',
            data: { 
              billId,
              billData    
            }
          });

          ref.onClose.subscribe(value => {
            if (value) this.getData();
          });
        }
      }
    });
}

openRecreateDialog() {
  const ref = this._dialogService.open(RecreateBillDialogComponent, {
    header: this._languageService.getTransValue('billing.recreate'),
    width: '30vw',
    height: '45vh',
    data: {
      billId: this.selectedRow?.id,
    },
  });

  ref.onClose.subscribe((templateId: number) => {
    if (templateId) {
      this.recreateBill(this.selectedRow?.id, templateId);
    }
  });
}


confirmUndo() {
  this.deleteDialogRef = this._dialogService.open(
    SharedConfirmDialogComponent,
    {
      modal: true,
      styleClass: 'w-[400px]',
      data: {
        type: ConfirmDialogType.Danger,
        title: this._languageService.getTransValue('billing.undoTitle', {
          value: this.selectedRow?.id,
        }),
        message: this._languageService.getTransValue('billing.undoMessage'),

        btns: [
          {
            label: this._languageService.getTransValue('lookups.discard'),
            styleClass: 'border border-grey500 text-grey500',
            command: () => {
              this.deleteDialogRef.close();
            },
          },

          {
            label: this._languageService.getTransValue('billing.undo'),
            styleClass: 'bg-textErrorBase text-white',
            command: () => {
              this.undoBill(this.selectedRow?.id);
              this.deleteDialogRef.close();
            },
          },
        ],
      },
    }
  );
}

recreateBill(billId: number, templateId: number) {
  this._apiService
    .post(
      API_Config.bill.ReCreate +
      `?BillingId=${billId}&TemplateId=${templateId}`,
      {}
    )
    .pipe(this._unsubscribeService.takeUntilDestroy())
    .subscribe({
      next: (res: ApiRes) => {
        if (res.isSuccess && res.message) {
          window.open(res.message, '_blank');
        }
      },
      error: () => {
        this._toastrNotifiService.displayError('Failed to recreate invoice');
      }
    });
}



undoBill(id: number) {
  this._apiService.post(API_Config.bill.UnDoBill + '?BillId=' + id, {})
    .pipe(this._unsubscribeService.takeUntilDestroy())
    .subscribe({
      next: (res: ApiRes) => {
        if (res.isSuccess) {
          this._toastrNotifiService.displaySuccess(res.message);
          this.getData();
        }
      }
    });
}

  setMenuItems() {
    this.menuItems = [
      // {
      //   label: 'Edit',
      //   icon: 'icon-edit',
      //   command: () => {
      //     this._router.navigate([
      //       '/billing/bills/update',
      //       this.selectedRow?.id,
      //     ]);
      //   },
      // },
      // { separator: true },
      // {
      //   label: 'Print',
      //   icon: 'icon-show',
      //   command: () => {},
      // },
      {
        label: this._languageService.getTransValue('billing.undo'),
        icon: 'icon-undo',
        command: () => {
          this.confirmUndo();
        },
      },
      {
        label: this._languageService.getTransValue('billing.recreate'),
        icon: 'icon-reload',
        command: () => {
          this.openRecreateDialog();
        },
      },
      {
        label: this._languageService.getTransValue('billing.applyDiscount'),
        icon: 'icon-discount',
        command: () => {
          this.applyDiscount(this.selectedRow?.id);
        },
      },
      // {
      //   label: 'Write Off',
      //   icon: 'icon-delete',
      //   command: () => {
      //     this.writeOff(this.selectedRow?.id);
      //   },
      // },
    ];
  }
  writeOff(id: number) {
    console.log('Write Off', id);
  }

  onFilter(e: any) {
    this.filterOptions = { ...this.filterOptions, ...e };
    this.getData();
  }
  onRowSelected(rowData: any) {
    this.selectedRow = rowData;
  }
  onPageChange(event: PaginatorState): void {
    this.filterOptions.pagSize = Number(event.rows);
    this.filterOptions.pageNum = (event.first ?? 0) / (event.rows ?? 0) + 1;
    this.filterOptions = { ...this.filterOptions };
    this.getData();
  }
  setView(view: string) {
    this.selectedView.set(view);
    this.updateColumnsBasedOnView();
  }
  ngOnDestroy(): void {
    this._unsubscribeService.destroy();
  }
}
