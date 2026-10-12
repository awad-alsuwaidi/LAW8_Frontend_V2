import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, SharedModule } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { EmptyConfig } from 'src/app/@shared/components/shared-empty-section/interface/empty-config.interface';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { Payments_Column } from './payments-columns.config';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedEmptySectionComponent } from 'src/app/@shared/components/shared-empty-section/shared-empty-section.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { BillsFilterEditorComponent } from 'src/app/pages/billing/components/bills-filter-editor/bills-filter-editor.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [
    SharedModule,
    TranslateModule,
    SharedButtonComponent,
    BillsFilterEditorComponent,
    TableModule,
    PaginatorModule,
    MenuModule,
    CommonModule,
    SharedTableComponent,
    SharedEmptySectionComponent,
  ],
  templateUrl: './payments-list.component.html',
  styleUrl: './payments-list.component.scss',
})
export class PaymentsListComponent implements OnInit, OnDestroy {
  _router = inject(Router);
  _languageService = inject(LanguageService);
  _unsubscribeService = inject(UnsubscribeService);
  _apiService = inject(ApiService);
  _dialogService = inject(DialogService);
  _toastrNotifiService = inject(ToastrNotifiService);

  menuItems: MenuItem[] = [];
  selectedRow: any;
  filterOptions: any = {
    pageNum: 1,
    pagSize: 10,
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
  selectedView = signal<string>('card');
  deleteDialogRef: any;
  isLoading = false;

  ngOnInit(): void {
    this.updateColumnsBasedOnView();
  }
  updateColumnsBasedOnView() {
    this.columns =
      this.selectedView() == 'card'
        ? [...Payments_Column]
        : [...Payments_Column];
  }
  getData() {
    this.isLoading = true;
    this._apiService
      .get(API_Config.general.Payments, this.filterOptions)
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
  setMenuItems() {
    this.menuItems = [
      {
        label: 'Edit',
        icon: 'icon-edit',
        command: () => {
          this._router.navigate([
            '/billing/expenses/update',
            this.selectedRow.id,
          ]);
        },
      },
      { separator: true },
      {
        label: 'Delete',
        icon: 'icon-trash',
        command: () => {
          this.onDelete();
        },
      },
    ];
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
  deleteRow(rowDataId: number) {}
  ngOnDestroy(): void {
    this._unsubscribeService.destroy();
  }
}
