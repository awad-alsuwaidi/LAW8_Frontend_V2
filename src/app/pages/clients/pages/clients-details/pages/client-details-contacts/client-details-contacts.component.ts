import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { MenuModule } from 'primeng/menu';
import { ApiService } from 'src/app/@core/api/api.service';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ClientDetailsContactsEditorComponent } from './client-details-contacts-editor/client-details-contacts-editor.component';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { ActivatedRoute, Params } from '@angular/router';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { PermissionService } from 'src/app/@core/services/permission.service';

@Component({
  selector: 'app-client-details-contacts',
  standalone: true,
  imports: [SharedButtonComponent, SharedModule, MenuModule],
  templateUrl: './client-details-contacts.component.html',
  styleUrl: './client-details-contacts.component.scss',
})
export class ClientDetailsContactsComponent implements OnInit, OnDestroy {
  _languageService = inject(LanguageService);
  _permissionService = inject(PermissionService);
  selectedRow: any;
  menuItems: MenuItem[] = [
    {
      label: 'Vew Details',
      icon: 'icon-show',
      visible: this._permissionService.hasPermission('View_ClientContact'),
      command: () => {
        this.onOpenContactEditor('view');
      },
    },
    { separator: true },
    {
      label: 'Edit',
      icon: 'icon-edit',
      visible: this._permissionService.hasPermission('Update_ClientContact'),
      command: () => {
        this.onOpenContactEditor('edit');
      },
    },
    { separator: true },
    {
      label: 'Delete',
      icon: 'icon-trash',
      visible: this._permissionService.hasPermission('Delete_ClientContact'),
      command: () => {
        this.onDelete();
      },
    },
  ];
  contacts: any[] = [];
  _dialogService = inject(DialogService);
  _apiService = inject(ApiService);
  _unsubscribeService = inject(UnsubscribeService);
  _route = inject(ActivatedRoute);
  _toastrNotifiService = inject(ToastrNotifiService);

  clientId!: number;

  ngOnInit(): void {
    this.getParams();
  }
  getParams() {
    this._route.params
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe({
        next: (params: Params) => {
          if (params['id']) {
            this.clientId = params['id'];
          }
          this.getData();
        },
      });
  }

  getData() {
    if (!this.clientId) return;
    const params = { clientId: this.clientId, orderByDirection: 'ASC' };
    this._apiService
      .get(API_Config.clientsContact.get, params)
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess && res.result.length > 0) {
            this.contacts = res.result;
          }
        },
      });
  }
  onRowSelected(rowData: any) {
    this.selectedRow = rowData;
  }

  onOpenContactEditor(mode?: string) {
    const ref = this._dialogService.open(ClientDetailsContactsEditorComponent, {
      header: mode
        ? mode === 'view'
          ? this._languageService.getTransValue('matters.viewContact')
          : this._languageService.getTransValue('matters.editContact')
        : this._languageService.getTransValue('matters.addContact'),

      width: '600px',
      data: { rowData: this.selectedRow, mode, clientId: this.clientId },
    });
    ref.onClose.subscribe((result: any) => {
      this.selectedRow = null;
      if (result) {
        this.getData();
      }
    });
  }
  onDelete() {
    const confirmDeleteRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        data: {
          type: ConfirmDialogType.Success,
          title: 'Are You Sure You Want Delete?',
          message: 'You Will Delete Contact',
          btns: [
            {
              label: this._languageService.getTransValue('common.cancel'),
              styleClass: 'border border-grey500 text-grey500',
              command: () => {
                confirmDeleteRef.close();
              },
            },
            {
              label: 'Delete',
              styleClass: 'bg-textErrorBase text-white',
              command: () => {
                confirmDeleteRef.close(true);
              },
            },
          ],
        },
      }
    );
    confirmDeleteRef.onClose.subscribe({
      next: (res) => {
        if (res) {
          this._apiService
            .post(
              API_Config.clientsContact.delete,
              {},
              { id: this.selectedRow.id }
            )
            .pipe(this._unsubscribeService.takeUntilDestroy())
            .subscribe({
              next: (res: ApiRes) => {
                if (res && res.isSuccess) {
                  this._toastrNotifiService.displaySuccess(res.message);
                  this.getData();
                }
              },
            });
        }
      },
    });
  }
  ngOnDestroy(): void {
    this._unsubscribeService.destroy();
  }
}
