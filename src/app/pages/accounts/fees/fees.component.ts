import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { MenuItem } from 'primeng/api';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Fees_Columns } from './fees-columns.config';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { DialogService } from 'primeng/dynamicdialog';
import { SharedEmptySectionComponent } from 'src/app/@shared/components/shared-empty-section/shared-empty-section.component';
import { EmptyConfig } from 'src/app/@shared/components/shared-empty-section/interface/empty-config.interface';
import { BillsFilterEditorComponent } from '../../billing/components/bills-filter-editor/bills-filter-editor.component';
import { finalize } from 'rxjs';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-fees',
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
    TooltipModule
  ],
  templateUrl: './fees.component.html',
  styleUrl: './fees.component.scss',
})
export class FeesComponent implements OnInit, OnDestroy {
  _router = inject(Router);
  _languageService = inject(LanguageService);
  _unsubscribeService = inject(UnsubscribeService);
  _apiService = inject(ApiService);
  _dialogService = inject(DialogService);
  _toastrNotifiService = inject(ToastrNotifiService);
  _permissionService = inject(PermissionService);
  routeData: any;

  menuItems: MenuItem[] = [];
  selectedRow: any;
  filterOptions: any = {
    pageNum: 1,
    pagSize: 10,
    orderByDirection: 'ASC',
    typeId: 2,
  };
  emptyConfig: EmptyConfig = {
    addPermission: '',
    messageTitle: 'Load Data First',
    description: '',
  };
  data: any[] = [];
  totalRecords: number = 0;
  columns: any[] = [];
  selectedView = signal<string>('card');
  deleteDialogRef: any;
  isLoading = false;
_route=inject(ActivatedRoute)
  // ngOnInit(): void {
  //   this.updateColumnsBasedOnView();
  // }
  ngOnInit(): void {
  this.updateColumnsBasedOnView();

  this._route.queryParams.subscribe(params => {
    if (params['savedFilters']) {
      try {
        const saved = JSON.parse(params['savedFilters']);
        this.filterOptions = { ...this.filterOptions, ...saved };
        this.getData();
      } catch {}
    }
  });
}
onRowSelected(rowData: any) {
  this.selectedRow = rowData;
  this.setMenuItems();
}


  updateColumnsBasedOnView() {
    this.columns =
      this.selectedView() == 'card' ? [...Fees_Columns] : [...Fees_Columns];
  }

  getData() {
    const params = {
      ...this.filterOptions,
      typeId: 2,
    };

    this.isLoading = true;

    this._apiService
      .get(API_Config.timesheet.getList, params)
      .pipe(
        finalize(() => (this.isLoading = false)),  
        this._unsubscribeService.takeUntilDestroy()
      )
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

setMenuItems() {
  const hasInvoice = !!this.selectedRow?.invoiceNo;

  this.menuItems = [
    {
      label: 'Edit',
      icon: 'icon-edit',
      visible: this._permissionService.hasPermission('Update_Fees'),
      disabled: hasInvoice,
      tooltip: hasInvoice
        ? `This fee is invoiced (Invoice No: ${this.selectedRow.invoiceNo})`
        : '',
      command: () => {
        if (hasInvoice) return;
        this._router.navigate(
          ['/accounts/fees/update', this.selectedRow.id],
          {
            queryParams: {
              savedFilters: JSON.stringify(this.filterOptions),
            },
          }
        );
      },
    },
    { separator: true },
    {
      label: 'Delete',
      icon: 'icon-trash',
      visible: this._permissionService.hasPermission('Delete_Fees'),
      disabled: hasInvoice,
      tooltip: hasInvoice
        ? `This fee is invoiced (Invoice No: ${this.selectedRow.invoiceNo})`
        : '',
      command: () => {
        if (hasInvoice) return;
        this.onDelete();
      },
    },
  ];
}


  onFilter(e: any) {
    this.filterOptions = { ...this.filterOptions, ...e, typeId: 2 };
    this.getData();
  }

  onPageChange(event: PaginatorState): void {
    this.filterOptions.pagSize = Number(event.rows);
    this.filterOptions.pageNum = (event.first ?? 0) / (event.rows ?? 0) + 1;
    this.filterOptions = { ...this.filterOptions, typeId: 2 };
    this.getData();
  }

  setView(view: string) {
    this.selectedView.set(view);
    this.updateColumnsBasedOnView();
  }

  onDelete() {
    this.deleteDialogRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        modal: true,
        styleClass: 'w-[400px]',
        data: {
          type: ConfirmDialogType.Danger,
          title: this._languageService.getTransValue('messages.deleteTitle', {
            value: this.selectedRow?.id,
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
              label: this._languageService.getTransValue('lookups.delete'),
              styleClass: 'bg-textErrorBase text-white',
              command: () => {
                this.deleteRow(this.selectedRow?.id);
              },
            },
          ],
        },
      }
    );
  }

  // deleteRow(rowDataId: number) {
  //   this._apiService
  //     .post(
  //       API_Config.timesheet.delete,
  //       {},
  //       { id: rowDataId, typeId: 2 }
  //     )
  //     .pipe(this._unsubscribeService.takeUntilDestroy())
  //     .subscribe({
  //       next: (res: ApiRes) => {
  //         if (res && res.isSuccess) {
  //           this.getData();
  //           this._toastrNotifiService.displaySuccess(res.message);
  //           this.deleteDialogRef.close();
  //         }
  //       },
  //     });
  // }
  isDeleting: boolean = false;
  private _unsubscribe = inject(UnsubscribeService);

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
  ngOnDestroy(): void {
    this._unsubscribeService.destroy();
  }
}
