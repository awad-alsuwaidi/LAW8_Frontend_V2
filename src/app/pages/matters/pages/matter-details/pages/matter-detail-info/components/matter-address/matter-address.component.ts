import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { ApiService } from 'src/app/@core/api/api.service';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { MatterAddressDto } from 'src/app/pages/matters/interfaces/matter-address.interface';
import { MatterAddressEditorComponent } from './matter-address-editor/matter-address-editor.component';
import { TranslateModule } from '@ngx-translate/core';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { LanguageService } from 'src/app/@core/services';
import { Router } from '@angular/router';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-matter-address',
  standalone: true,
  imports: [SharedButtonComponent, TableModule, TranslateModule,CommonModule],
  templateUrl: './matter-address.component.html',
  styleUrl: './matter-address.component.scss',
})
export class MatterAddressComponent implements OnInit, OnDestroy {
  _dialogService = inject(DialogService);
   _permissionService = inject(PermissionService);
  _unsubscribe = inject(UnsubscribeService);
  _apiService = inject(ApiService);
  _router = inject(Router);
  _languageService = inject(LanguageService);
  matterAddress: MatterAddressDto[] = [];
  @Input({ required: true }) matterIdentifier!: string;
  ngOnInit(): void {
    this.getMatterAddress();
  }
  getMatterAddress() {
    const params = {
      pageNum: 1,
      pagSize: PAGESIZE,
      orderByDirection: 'ASC',
      matterId: this.matterIdentifier,
    };
    this._apiService
      .get(API_Config.matterAddress.get, params)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) this.matterAddress = res.result.dataList;
        },
      });
  }
  hasPermission(permission: string): boolean {
  return this._permissionService.hasPermission(permission);
}

  openAddressEditor(rowData?: any) {
    const ref = this._dialogService.open(MatterAddressEditorComponent, {
      header: rowData
        ? this._languageService.getTransValue('matters.updateaAddress')
        : this._languageService.getTransValue('matters.addAddress'),
      data: { rowData, matterIdentifier: this.matterIdentifier },
    });
    ref.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
      next: (res: any) => {
        if (this.matterIdentifier) this.getMatterAddress();
      },
    });
  }
  onDelete(rowData: MatterAddressDto) {
    const ref = this._dialogService.open(SharedConfirmDialogComponent, {
      modal: true,
      styleClass: 'w-[400px]',
      data: {
        type: ConfirmDialogType.Danger,
        title: this._languageService.getTransValue(
          'matters.deleteAddressTitle'
        ),
        message: this._languageService.getTransValue(
          'matters.deleteAddressMessage',
          { value: rowData?.line1 }
        ),
        btns: [
          {
            label: this._languageService.getTransValue('lookups.discard'),
            styleClass: 'border border-grey500 text-grey500',
            command: () => {
              ref.close();
            },
          },
          {
            label: this._languageService.getTransValue('lookups.delete'),
            styleClass: 'bg-textErrorBase text-white',
            command: () => {
              this._apiService
                .post(API_Config.matterAddress.delete, {}, { id: rowData.id })
                .pipe(this._unsubscribe.takeUntilDestroy())
                .subscribe({
                  next: (res: ApiRes) => {
                    if (res && res.isSuccess) {
                      ref.close();
                      this.getMatterAddress();
                    }
                  },
                });
            },
          },
        ],
      },
    });
  }
  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
