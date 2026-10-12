import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ApiService } from 'src/app/@core/api/api.service';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { MatterAddressDto } from 'src/app/pages/matters/interfaces/matter-address.interface';
import { MatterBillingRateExceptionEditorComponent } from './matter-billing-rate-exception-editor/matter-billing-rate-exception-editor.component';
import { TranslateModule } from '@ngx-translate/core';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { LanguageService } from 'src/app/@core/services';
import { Router } from '@angular/router';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { Billing_Rate_Exception_Columns } from './matter-billing-rate-exception-column.config';

@Component({
  selector: 'app-matter-billing-rate-exception',
  standalone: true,
  imports: [
    SharedButtonComponent,
    TableModule,
    TranslateModule,
    SharedTableComponent
  ],
  templateUrl: './matter-billing-rate-exception.component.html',
  styleUrl: './matter-billing-rate-exception.component.scss'
})
export class MatterBillingRateExceptionComponent implements OnInit, OnDestroy {


  _dialogService = inject(DialogService);
  _unsubscribe = inject(UnsubscribeService);
  _apiService = inject(ApiService);
  _router = inject(Router)
  _languageService = inject(LanguageService)
  matterAddress: MatterAddressDto[] = [];
  @Input({ required: true }) matterIdentifier!: string;
   protected data: any[] = [];
    protected columns: any[] = Billing_Rate_Exception_Columns;
    protected pagination: any = { pagSize: PAGESIZE, pageNum: 1, orderByDirection: 'ASC' };
  ngOnInit(): void {
    this.getData();
  }
  
  getData() {
    const params = {
      pageNum: 1,
      pagSize: PAGESIZE,
      orderByDirection: 'ASC',
      matterId: this.matterIdentifier,
    };
    this._apiService.get(API_Config.matterBillingException.get, params).pipe(
      this._unsubscribe.takeUntilDestroy()
    ).subscribe({
      next: (res: ApiRes) => {
        if (res && res.isSuccess) {
        this.data = res.result.dataList; 
      }
      }
    })
  }
  openEditor(rowData?: any) {
    const ref = this._dialogService.open(MatterBillingRateExceptionEditorComponent, {
      header: rowData
        ? this._languageService.getTransValue('matters.updateRateException')
        : this._languageService.getTransValue('matters.addRateException'),
      data: { rowData, matterIdentifier: this.matterIdentifier }
    })
    ref.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
      next: (res: any) => {
        if (this.matterIdentifier) this.getData()
      }
    })
  }
  openViewer(rowData: any) {
  const ref = this._dialogService.open(MatterBillingRateExceptionEditorComponent, {
    header: this._languageService.getTransValue('matters.viewRateException'),
    data: { 
      rowData, 
      matterIdentifier: this.matterIdentifier,
      viewMode: true 
    }
  });

}

  onDelete(rowData: MatterAddressDto) {
    const ref = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        modal: true,
        styleClass: 'w-[400px]',
        data: {
          type: ConfirmDialogType.Danger,
          title: this._languageService.getTransValue(
            'matters.deleteRateExceptionTitle'
          ),
          message: this._languageService.getTransValue(
            'matters.deleteRateExceptionMessage', { value: rowData?.line1 }
          ),
          btns: [
            {
              label: this._languageService.getTransValue(
                'lookups.discard'
              ),
              styleClass: 'border border-grey500 text-grey500',
              command: () => {
                ref.close();
              },
            },
            {

              label: this._languageService.getTransValue(
                'lookups.delete'),
              styleClass: 'bg-textErrorBase text-white',
              command: () => {
                this._apiService.post(API_Config.matterBillingException.delete, {}, { id: rowData.id }).pipe(
                  this._unsubscribe.takeUntilDestroy()
                ).subscribe({
                  next: (res: ApiRes) => {
                    if (res && res.isSuccess) {
                      ref.close();
                      this.getData()
                    }
                  }
                })
              },
            },
          ],
        },
      }
    );

  }
  onPageChange(e: any) {
    this.pagination.pagSize = Number(e.rows);
    this.pagination.pageNum = e.first / e.rows + 1;
    this.getData();
  }
  ngOnDestroy(): void {
    this._unsubscribe.destroy()
  }
}
