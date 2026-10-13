import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedBreadcrumbComponent } from 'src/app/@shared/components/shared-breadcrumb/shared-breadcrumb.component';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { MatterTaskPriorityLabel, MatterTaskPriority } from '../../matters/enums/matter-taskPriority';
import { PredefinedTaskDto } from '../lookups-predefined-tasks/interfaces/predefined-tasks.interface';
import { Predefined_Task_Columns } from '../lookups-predefined-tasks/predefined-task-columns.config';
import { matterTask_priorityConfig } from '../lookups-predefined-tasks/predefined-task-priority.config';
import { Bank_Account_Columns } from './bankAccounts-columns.config';
import { BankAccountsEditorComponent } from './bank-accounts-editor/bank-accounts-editor.component';
import { isActive_statusConfig } from '../lookups-categories/lookups-categories-status.config';

@Component({
  selector: 'app-bank-accounts',
  standalone: true,
  imports: [
    SharedTableComponent,
    SharedModule,
    SharedButtonComponent,
    SharedBreadcrumbComponent
  ],
  templateUrl: './bank-accounts.component.html',
  styleUrl: './bank-accounts.component.scss'
})
export class BankAccountsComponent implements OnInit, OnDestroy {
  @Input() set id(value: number) {
    this.matterIdentifier = value
  }
  protected statusConfig = isActive_statusConfig;                 
  matterIdentifier: any;
  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _dialogService = inject(DialogService);
  private _languageService = inject(LanguageService);
  private _toastrNotifiService = inject(ToastrNotifiService);
  protected _router = inject(Router);
  protected _route = inject(ActivatedRoute);
  protected data: any[] = [];
  protected columns: any[] = Bank_Account_Columns;
  protected pagination: any = { pagSize: PAGESIZE, pageNum: 1, orderByDirection: 'ASC' };
  protected first!: number;
  private deleteDialogRef!: DynamicDialogRef;
  isLoading = false;


  ngOnInit(): void {
    this.getData();
  }

  onPageChange(e: any) {
    this.pagination.pagSize = Number(e.rows);
    this.pagination.pageNum = e.first / e.rows + 1;
    this.first = e?.first;
    this.getData();
  }
getData() {
  this.isLoading = true;
  this.pagination = { ...this.pagination };
  this._apiService
    .get(API_Config.bankAccounts.get, this.pagination)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res: any) => {
        console.log('📦 Raw response:', res);                    
        console.log('📦 res.data:', res?.data);                  
        console.log('📦 res.result:', res?.result);              

        const result = res?.data ?? res?.result ?? {};
        const items: any[] = result?.items ?? result?.dataList ?? [];

        console.log('📦 items count:', items.length);            
        console.log('📦 items:', items);                         

        this.data = items.map((obj: any) => ({
          ...obj,
          isActive:
            typeof obj.isActive === 'boolean' ? obj.isActive : !!obj.active,
        }));

        console.log('📦 this.data:', this.data);                 

        this.pagination.totalElements = result?.totalCount ?? 0;
        this.pagination = { ...this.pagination };
          this.isLoading = false;
        },
        error: () => (this.isLoading = false),
    });
}

openBankAccountEditor(rowData?: any) {
  const ref = this._dialogService.open(BankAccountsEditorComponent, {
    header: rowData
      ? this._languageService.getTransValue('matters.updateBankAccount')
      : this._languageService.getTransValue('matters.addBankAccount'),
    data: { rowData, matterIdentifier: this.matterIdentifier },
    width: '720px',
  });

  ref.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
    next: (res: any) => {
      if (res) this.getData();
    },
  });
}

deleteTask(bankAccountId: number) {
  this._apiService
    .delete(`${API_Config.bankAccounts.delete}/${bankAccountId}`)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res: any) => {
        if (res && (res.isSuccess || res.success)) {
          if (this.data.length === 1) this.pagination.pageNum--;
          this.getData();
          this._toastrNotifiService.displaySuccess(res.message);
          this.deleteDialogRef.close();
        }
      },
      error: (err: any) =>
        this._toastrNotifiService.displayError(err?.error?.message),
    });
}
  

  onDelete(rowData: PredefinedTaskDto) {
    this.deleteDialogRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        modal: true,
        styleClass: 'w-[400px]',
        // width: '30vw',
        data: {
          type: ConfirmDialogType.Danger,
          title: this._languageService.getTransValue(
            'matters.deleteTaskTitle',
            { value: rowData?.id }
          ),
          message: this._languageService.getTransValue(
            'matters.deleteTaskMessage'
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
              // 'Delete',
              styleClass: 'bg-textErrorBase text-white',
              command: () => {
                this.deleteTask(rowData.id);
              },
            },
          ],
        },
      }
    );
  }

  onSort(event: any) {
    this.pagination.orderBy = event.field;
    this.pagination.orderByDirection = event.order === 1 ? 'ASC' : 'DESC';
    this.getData();
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}