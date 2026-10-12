import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { Clients_Columns } from './contacts-columns.config';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ContactFilterComponent } from './components/contact-filter/contact-filter.component';
import { ContactEditorComponent } from './components/contact-editor/contact-editor.component';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    SharedTableComponent,
    SharedModule,
    SharedButtonComponent,
    MenuModule,
    ContactFilterComponent,
  ],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
})
export class ContactsComponent implements OnInit, OnDestroy {
  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _dialogService = inject(DialogService);
  private _languageService = inject(LanguageService);
  private _toastrNotifiService = inject(ToastrNotifiService);
  protected _router = inject(Router);
  protected _route = inject(ActivatedRoute);
  protected data: any[] = [];
  protected columns: any[] = Clients_Columns;
  protected pagination: any = {
    pagSize: PAGESIZE,
    pageNum: 1,
    orderByDirection: 'ASC',
  };
  protected first!: number;
  private deleteDialogRef!: DynamicDialogRef;
  _permissionService = inject(PermissionService);
  isInhouse = environment.brand === 'inhouse';

  menuItems: MenuItem[] = [];
  selectedRow: any;
  ngOnInit(): void {
    this.getData();
    this.columns = this.columns.map((col) => {
      if (col.isClientNo) {
        return {
          ...col,
          header: this.isInhouse ? 'common.entityNo' : 'common.clientNo',
        };
      }
      return col;
    });
  }
  onFilter(e: any) {
    this.pagination.search = e.search;
    this.getData();
  }
  onPageChange(e: any) {
    this.pagination.pagSize = Number(e.rows);
    this.pagination.pageNum = e.first / e.rows + 1;
    this.first = e?.first;
    this.getData();
  }
  getData() {
    this.setMenuItems();
    this._apiService
      .get(API_Config.contacts.get, this.pagination)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.data = res.result.dataList.map((obj: any) => {
              return {
                ...obj,
                name: obj.firstName + ' ' + obj.lastName,
              };
            });
            this.pagination.totalElements = res.result.totalCount;
            this.pagination = { ...this.pagination };
          }
        },
      });
  }
  // openContactEditor() {
  //   const ref = this._dialogService.open(ContactEditorComponent, {
  //     header: this.selectedRow ? 'Update Contact' : 'Add Contact',
  //     width: '600px',
  //     data: { rowData: this.selectedRow }
  //   })
  //   ref.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
  //     next: (res) => {
  //       this.selectedRow = null;
  //       if (res) {
  //         this.getData()
  //       }
  //     }
  //   })
  // }
  openContactEditor(mode?: 'view' | 'edit' | 'add') {
    const ref = this._dialogService.open(ContactEditorComponent, {
      header:
        mode === 'view'
          ? 'Contact Details'
          : this.selectedRow
            ? 'Update Contact'
            : 'Add Contact',

      width: '600px',

      data: {
        rowData: this.selectedRow,
        mode: mode,
        isViewMode: mode === 'view',
      },
    });

    ref.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
      next: (res) => {
        this.selectedRow = null;
        if (res) {
          this.getData();
        }
      },
    });
  }

  setMenuItems() {
    this.menuItems = [
      {
        label: 'View Details',
        icon: 'icon-show',
        command: () => {
          this.openContactEditor('view');
        },
      },
      { separator: true },

      {
        label: 'Edit',
        icon: 'icon-edit',
        visible: this._permissionService.hasPermission('Update_Contacts'),

        command: () => {
          this.openContactEditor();
        },
      },
      { separator: true },
      {
        label: 'Delete',
        icon: 'icon-trash',
        visible: this._permissionService.hasPermission('Delete_Contacts'),
        command: () => {
          this.onDelete();
        },
      },
    ];
  }
  onRowSelected(rowData: any) {
    this.selectedRow = rowData;
  }

  onDelete() {
    this.deleteDialogRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        modal: true,
        styleClass: 'w-[400px]',
        data: {
          type: ConfirmDialogType.Danger,
          title: this._languageService.getTransValue(
            'matters.deleteTaskTitle',
            { value: this.selectedRow?.id },
          ),
          message: this._languageService.getTransValue(
            'matters.deleteTaskMessage',
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
                this.deleteContact();
              },
            },
          ],
        },
      },
    );
  }
  onSort(e: any) {
    if (!e || !e.field) return;

    const direction = e.order === 1 ? 'ASC' : 'DESC';

    if (
      this.pagination.orderBy === e.field &&
      this.pagination.orderByDirection === direction
    ) {
      return;
    }

    this.pagination.orderBy = e.field;
    this.pagination.orderByDirection = direction;
    this.pagination.pageNum = 1;
    this.first = 0;

    this.getData();
  }
  deleteContact() {
    this._apiService
      .post(API_Config.contacts.delete, {}, { id: this.selectedRow.id })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.data.length == 1 ? this.pagination.pageNum-- : null;
            this.getData();
            this._toastrNotifiService.displaySuccess(res.message);
            this.deleteDialogRef.close();
          }
        },
      });
  }
  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
