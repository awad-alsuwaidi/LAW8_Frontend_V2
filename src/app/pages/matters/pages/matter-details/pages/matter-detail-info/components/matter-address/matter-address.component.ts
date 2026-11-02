import {
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
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
  imports: [SharedButtonComponent, TableModule, TranslateModule, CommonModule],
  templateUrl: './matter-address.component.html',
  styleUrl: './matter-address.component.scss',
})
export class MatterAddressComponent implements OnInit, OnChanges, OnDestroy {
  _dialogService = inject(DialogService);
  _permissionService = inject(PermissionService);
  _unsubscribe = inject(UnsubscribeService);
  _apiService = inject(ApiService);
  _router = inject(Router);
  _languageService = inject(LanguageService);
  matterAddress: MatterAddressDto[] = [];

  @Input({ required: true }) matterIdentifier!: string;

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['matterIdentifier'] && this.matterIdentifier) {
      this.getMatterAddress();
    }
  }

  hasPermission(permission: string): boolean {
    return this._permissionService.hasPermission(permission);
  }

getMatterAddress() {
  if (!this.matterIdentifier) {
    this.matterAddress = [];
    return;
  }

  const params: Record<string, any> = {
    'filters[matterId]': this.matterIdentifier,
    pageNum: 1,
    pagSize: PAGESIZE,
    orderByDirection: 'ASC',
  };

  this._apiService
    .get(API_Config.matterAddress.get, params)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res: ApiRes) => {
        this.matterAddress = this.extractArray(res);
      },
      error: () => {
        this.matterAddress = [];
      },
    });
}

private extractArray(res: any): MatterAddressDto[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.dataList)) return res.dataList;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.result)) return res.result;
  if (Array.isArray(res.result?.dataList)) return res.result.dataList;
  if (Array.isArray(res.result?.items)) return res.result.items;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.dataList)) return res.data.dataList;
  if (Array.isArray(res.data?.items)) return res.data.items;
  return [];   
}

openAddressEditor(rowData?: any) {
  const ref = this._dialogService.open(MatterAddressEditorComponent, {
    header: rowData
      ? this._languageService.getTransValue('matters.updateaAddress')
      : this._languageService.getTransValue('matters.addAddress'),
    data: { rowData, matterIdentifier: this.matterIdentifier },
  });

  if (!ref) {
    console.error(
      'DialogService returned null — <p-dynamicDialog /> is not in the DOM.',
    );
    return;
  }

  ref.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
    next: () => {
      if (this.matterIdentifier) this.getMatterAddress();
    },
  });
}

onDelete(rowData: MatterAddressDto) {
  const ref: DynamicDialogRef = this._dialogService.open(
    SharedConfirmDialogComponent,
    {
      modal: true,
      styleClass: 'w-[400px]',
      data: {
        type: ConfirmDialogType.Danger,
        title: this._languageService.getTransValue('matters.deleteAddressTitle'),
        message: this._languageService.getTransValue('matters.deleteAddressMessage', {
          value: rowData?.line1,
        }),
        btns: [
          {
            label: this._languageService.getTransValue('lookups.discard'),
            styleClass: 'border border-grey500 text-grey500',
            command: () => ref.close(),
          },
          {
            label: this._languageService.getTransValue('lookups.delete'),
            styleClass: 'bg-textErrorBase text-white',
            command: () => {
              let path = API_Config.matterAddress.delete;
              path = path.includes('{id}')
                ? path.replace('{id}', String(rowData.id))
                : `${path}/${rowData.id}`;
              this._apiService
                .delete(path, {})
                .pipe(this._unsubscribe.takeUntilDestroy())
                .subscribe({
                  next: (res: ApiRes) => {
                    if (res && res.isSuccess) {
                      ref.close();
                      this.getMatterAddress();
                    }
                  },
                  error: (err) => {
                    console.error('Delete failed:', err);
                  },
                });
            },
          },
        ],
      },
    }
  );
}

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
