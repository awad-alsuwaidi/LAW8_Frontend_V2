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
import { finalize } from 'rxjs'; 

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
  pagination: any = {
    PageNumber: 1,
    PageSize: PAGESIZE,
    SortBy: 'firstName',
    IsDescending: false,
  };
  protected first!: number;
  private deleteDialogRef!: DynamicDialogRef;
  _permissionService = inject(PermissionService);
  isInhouse = environment.brand === 'inhouse';

  isLoading: boolean = false;

  menuItems: MenuItem[] = [];
  selectedRow: any;

  ngOnInit(): void {
    this.getData();
    this.columns = this.columns.map((col) => {
      if (col.isClientNo) {
        return {
          ...col,
          header: this.isInhouse ? 'common.entityNo' : 'common.codeNo',
        };
      }
      return col;
    });
  }

  onFilter(e: any) {
    this.pagination.search = e.search;
    this.pagination.PageNumber = 1;
    this.getData();
  }

  getData() {
    this.isLoading = true; 
    this.setMenuItems();
    const params = {
      ...this.pagination,
      SearchTerm: this.pagination.search,
    };

    this._apiService
      .get(API_Config.contacts.get, params)
      .pipe(
        finalize(() => (this.isLoading = false)), 
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          const body = res?.data ?? res?.result;

          if (isSuccess && body) {
            this.data = (body.items || body.dataList || []).map((obj: any) => {
              const fullName = [obj.firstName, obj.middleName, obj.lastName]
                .filter((part) => part && part.trim() !== '')
                .join(' ');

              return {
                ...obj,
                name: fullName || 'Unknown',
              };
            });

            this.pagination.totalElements = body.totalCount || 0;
            this.pagination = { ...this.pagination };
          }
        },
      });
  }

  onPageChange(e: any) {
    const newPageSize = Number(e.rows);
    const newPageNumber = e.first / e.rows + 1;
    if (
      this.pagination.PageSize === newPageSize &&
      this.pagination.PageNumber === newPageNumber
    ) {
      return;
    }

    this.pagination.PageSize = newPageSize;
    this.pagination.PageNumber = newPageNumber;
    this.first = e?.first;
    this.getData();
  }

  onSort(e: any) {
    if (!e || !e.field) return;

    const newDescending = e.order === -1;
    if (
      this.pagination.SortBy === e.field &&
      this.pagination.IsDescending === newDescending
    ) {
      return;
    }

    this.pagination.SortBy = e.field;
    this.pagination.IsDescending = newDescending;
    this.pagination.PageNumber = 1;
    this.first = 0;

    this.getData();
  }

  deleteContact() {
    const url = `${API_Config.contacts.delete}/${this.selectedRow.id}`;

    this._apiService
      .delete(url)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          if (isSuccess) {
            this.data.length == 1 ? this.pagination.PageNumber-- : null;
            this.getData();
            this._toastrNotifiService.displaySuccess(res.message);
            this.deleteDialogRef.close();
          }
        },
      });
  }

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
            'matters.deleteContactTitle',
            { value: this.selectedRow?.id },
          ),
          message: this._languageService.getTransValue(
            'matters.deleteContactMessage',
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

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
