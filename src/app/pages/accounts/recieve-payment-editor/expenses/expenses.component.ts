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
import { Router } from '@angular/router';
import { Billing_Expenses_Columns } from './expenses-columns.config';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { DialogService } from 'primeng/dynamicdialog';
import { SharedEmptySectionComponent } from 'src/app/@shared/components/shared-empty-section/shared-empty-section.component';
import { EmptyConfig } from 'src/app/@shared/components/shared-empty-section/interface/empty-config.interface';
import { BillsFilterEditorComponent } from 'src/app/pages/billing/components/bills-filter-editor/bills-filter-editor.component';

@Component({
  selector: 'app-expenses',
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
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent implements OnInit, OnDestroy {

  _router = inject(Router);
  _languageService = inject(LanguageService);
  _unsubscribeService = inject(UnsubscribeService);
  _apiService = inject(ApiService);
  _dialogService = inject(DialogService);
  _toastrNotifiService=inject(ToastrNotifiService)

  menuItems: MenuItem[] = [];
  selectedRow: any;
  filterOptions: any = {
    pageNum: 1,
    pagSize: 5,
    orderByDirection: 'ASC',
  }
  emptyConfig:EmptyConfig={
    addPermission:'',
    messageTitle:'Load Data First',
    description:'Please select the billing period and relevant filters, then click "Load" to view your customized billing list.'
  }
  data: any[] = []
  totalRecords: number = 0;
  columns: any[] = []
  selectedView = signal<string>('card');
  deleteDialogRef: any;
  ngOnInit(): void {
    this.updateColumnsBasedOnView()
  }
  updateColumnsBasedOnView() {
    this.columns = this.selectedView() == 'card' ? [...Billing_Expenses_Columns] : [...Billing_Expenses_Columns]
  }
  getData() {
    this._apiService.get(API_Config.billingExpenses.get, this.filterOptions).pipe(
      this._unsubscribeService.takeUntilDestroy()
    ).subscribe({
      next: (res: ApiRes) => {
        if (res.isSuccess) {
          this.data = res.result.dataList;
          this.totalRecords = res.result.totalCount;
          this.setMenuItems()
        }
      }
    })
  }
  setMenuItems() {
    this.menuItems = [
      {
        label: 'Edit',
        icon: 'icon-edit',
        command: () => {
          this._router.navigate(['/billing/expenses/update', this.selectedRow.id])
        }
      },
      { separator: true },
      {
        label: 'Delete',
        icon: 'icon-trash',
        command: () => {
          this.onDelete()
        }
      }
    ];
  }
  onFilter(e: any) {
    this.filterOptions = { ...this.filterOptions, ...e }
    this.getData()
  }
  onRowSelected(rowData: any) {
    this.selectedRow = rowData;
  }
  onPageChange(event: PaginatorState): void {
    this.filterOptions.pagSize = Number(event.rows);
    this.filterOptions.pageNum = (event.first ?? 0) / (event.rows ?? 0) + 1;
    this.filterOptions = { ...this.filterOptions }
    this.getData();
  }
  setView(view: string) {
    this.selectedView.set(view);
    this.updateColumnsBasedOnView()
  }

  onDelete() {
    this.deleteDialogRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        modal: true,
        styleClass: 'w-[400px]',
        // width: '30vw',
        data: {
          type: ConfirmDialogType.Danger,
          title: this._languageService.getTransValue(
            'messages.deleteTitle',
            { value: this.selectedRow?.id }
          ),
          message: this._languageService.getTransValue(
            'messages.deleteMessage'
          ),
          btns: [
            {
              label: this._languageService.getTransValue('lookups.discard'),
              //'Discard',
              styleClass: 'border border-grey500 text-grey500',
              command: () => {
                this.deleteDialogRef.close();
              },
            },
            {
              label: this._languageService.getTransValue('lookups.delete'),
              //'Delete',
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
  deleteRow(rowDataId: number) {
    // this._apiService
    //   .post(API_Config.billingExpenses.delete, {}, { id: rowDataId })
    //   .pipe(this._unsubscribeService.takeUntilDestroy())
    //   .subscribe({
    //     next: (res: ApiRes) => {
    //       if (res && res.isSuccess) {
    //         this.getData();
    //         this._toastrNotifiService.displaySuccess(res.message);
    //         this.deleteDialogRef.close();
    //       }
    //     },
    //   });
  }
  ngOnDestroy(): void {
    this._unsubscribeService.destroy()
  }
}



