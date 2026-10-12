import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SharedButtonComponent } from '../../shared-button/shared-button.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedConfirmDialogComponent } from '../../shared-confirm-dialog/shared-confirm-dialog.component';
import { SharedContactEditorComponent } from './shared-contact-editor/shared-contact-editor.component';
import { PaginatorModule } from 'primeng/paginator';
import { MatterDetailsEditorComponent } from 'src/app/pages/matters/pages/matter-editor/pages/matter-details-editor/matter-details-editor.component';
import { MatterService } from 'src/app/pages/matters/services/matter.service';
import { EmptyConfig } from '../../shared-empty-section/interface/empty-config.interface';
import { SharedEmptySectionComponent } from '../../shared-empty-section/shared-empty-section.component';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { TableModule } from 'primeng/table';
import { SharedContactColumns } from './shared-contact-columns.config';

@Component({
  selector: 'app-shared-contact',
  standalone: true,
  imports: [
    SharedModule,
    SharedButtonComponent,
    MenuModule,
    TableModule,
    PaginatorModule,
    SharedEmptySectionComponent,
  ],
  providers: [MatterDetailsEditorComponent],
  templateUrl: './shared-contact.component.html',
  styleUrl: './shared-contact.component.scss',
})
export class SharedContactComponent implements OnInit, OnDestroy {
  selectedRow: any;
  menuItems: MenuItem[] = [];
  totalRecords: number = 0;
  contacts: any[] = [];
  contactColumns = SharedContactColumns;
  _dialogService = inject(DialogService);
  _apiService = inject(ApiService);
  _unsubscribeService = inject(UnsubscribeService);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _toastrNotifiService = inject(ToastrNotifiService);
  matterDetailsEditorComponent = inject(MatterDetailsEditorComponent);
  _matterService = inject(MatterService);
  _permissionService = inject(PermissionService);
  _languageService = inject(LanguageService);

  routeData: any;
  id!: number;
filterOptions = {
  pageNum: 1,
  pagSize: 10,
  orderBy: '',
  orderByDirection: 'ASC',
};
  formlyModel: any;
  // collect form data from pervious steps

  getFormsData = effect(() => {
    if (this._matterService.getMatter()) {
      this.formlyModel = this._matterService.getMatter();
      if (this.formlyModel?.law_MatterContactss)
        this.contacts = [...this.formlyModel.law_MatterContactss];
      if (!this.formlyModel.practsAreaId && this._router.url.includes('add'))
        this._router.navigate(['/matters/add']);
    }
  });
  emptyConfig?: EmptyConfig;
  ngOnInit(): void {
    this.routeData = this._route.snapshot.data;

    this.emptyConfig = {
      messageTitle: this._languageService.getTransValue(
        'clients.noContactsTitle'
      ),
      description: this._languageService.getTransValue(
        'clients.noContactsDescription'
      ),
      addPermission: this.routeData['addPermission'],
    };

    if (!this._router.url.includes('matters/inactive')) {
      const addButton = {
        label: this._languageService.getTransValue('clients.addNewContact'),
        command: () => {
          this.onOpenContactEditor();
        },
      };
      this.emptyConfig.addButton = addButton;
    }

    this.getParams();
    this.setMenuItems();
  }
  loadData(event: any) {
  this.filterOptions.pageNum = event.first / event.rows + 1;
  this.filterOptions.pagSize = event.rows;

  if (event.sortField) {
    this.filterOptions.orderBy = event.sortField;
    this.filterOptions.orderByDirection =
      event.sortOrder === 1 ? 'ASC' : 'DSC';
  }

  this.refreshData();
}
  handleSort(event: any) {
  if (!event?.field) return;

  this.filterOptions.orderBy = event.field;
  this.filterOptions.orderByDirection = event.order === 1 ? 'ASC' : 'DSC';

  this.filterOptions.pageNum = 1;
  this.refreshData();
}
onSort(field: string) {
  if (!field) return;

  if (this.filterOptions.orderBy === field) {
    this.filterOptions.orderByDirection =
      this.filterOptions.orderByDirection === 'ASC' ? 'DSC' : 'ASC';
  } else {
    this.filterOptions.orderBy = field;
    this.filterOptions.orderByDirection = 'ASC';
  }

  this.filterOptions.pageNum = 1;
  this.refreshData();
}
  getParams() {
    this._route.params
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe({
        next: (params: Params) => {
          if (params['id']) {
            this.id = params['id'];
          }
          this.refreshData();
          this.getData();
        },
      });
  }

  getData() {
    if (this._route.snapshot.data['data']) {
      this.contacts = [...this._route.snapshot.data['data'].result.dataList];

      this.totalRecords = this._route.snapshot.data['data'].result.totalCount;
      this.setMenuItems();
    }
  }

  setMenuItems() {
    this.menuItems = [
      {
        label: this._languageService.getTransValue('matters.viewDetails'),
        icon: 'icon-show',
        visible: this._permissionService.hasPermission(
          this.routeData['permission']
        ),
        command: () => {
          this.onOpenContactEditor('view');
        },
      },
      { separator: true },
      {
        label: this._languageService.getTransValue('matters.edit'),
        icon: 'icon-edit',
        visible: this._permissionService.hasPermission(
          this.routeData['editPermission']
        ),
        command: () => {
          this.onOpenContactEditor('edit');
        },
      },
      { separator: true },
      {
        label: this._languageService.getTransValue('matters.delete'),
        icon: 'icon-trash',
        visible: this._permissionService.hasPermission(
          this.routeData['deletePermission']
        ),
        command: () => {
          this.onDelete();
        },
      },
    ];
  }

  onRowSelected(rowData: any) {
    this.selectedRow = rowData;
  }

  onOpenContactEditor(mode?: string) {
    const ref = this._dialogService.open(SharedContactEditorComponent, {
      header: mode
        ? mode === 'view'
          ? this._languageService.getTransValue('matters.viewContact')
          : this._languageService.getTransValue('matters.editContact')
        : this._languageService.getTransValue('matters.addContact'),
      width: '600px',
      data: {
        rowData: this.selectedRow,
        mode,
        isViewMode: mode === 'view',
        id: this.id,
        endpoint: this.routeData['endpoint'],
        idKey: this.routeData['idKey'],
      },
    });
    ref.onClose.subscribe((result: any) => {
      this.selectedRow = null;
      if (typeof result === 'object') {
        let index = this.contacts.findIndex((obj) => obj.id === result.id);
        if (index != -1) {
          this.contacts[index] = result;
        } else {
          this.contacts.push({ ...result, id: this.contacts.length + 1 });
        }
        this.totalRecords = this.contacts.length;
        this._matterService.updateMatter({
          ...this.formlyModel,
          law_MatterContactss: this.contacts,
        });
      } else if (result) {
        this.refreshData();
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
          if (this._router.url.includes('add')) {
            this.contacts = this.contacts.filter(
              (obj) => obj != this.selectedRow
            );
            this.totalRecords = this.contacts.length;
            confirmDeleteRef.close();
            return;
          }

          this._apiService
            .post(
              this.routeData['endpoint'].delete,
              {},
              { id: this.selectedRow.id }
            )
            .pipe(this._unsubscribeService.takeUntilDestroy())
            .subscribe({
              next: (res: ApiRes) => {
                if (this.getApiSuccess(res)) {
                  this._toastrNotifiService.displaySuccess(
                    this.getApiMessage(res)
                  );
                  this.refreshData();
                }
              },
            });
        }
      },
    });
  }

  refreshData() {
    this.filterOptions = {
      ...this.filterOptions,
      [this.routeData['idKey']]: this.id,
    };

    this._apiService
      .get(this.routeData['endpoint'].get, this.filterOptions)
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (this.getApiSuccess(res)) {
            const result = this.getApiResult(res);
            this.contacts = (result.dataList ?? []).map((person: any) => {
              const normalizedPerson: any = {};

              for (const key in person) {
                const value = person[key];
                normalizedPerson[key] =
                  value === null || value === undefined ? '' : value;
              }

              return normalizedPerson;
            });

            this.totalRecords = result.totalCount ?? 0;
          }
        },
      });
  }

  getApiResult(res: any) {
    return res.Result ?? res.result ?? {};
  }

  getApiSuccess(res: any) {
    return res.IsSuccess ?? res.isSuccess ?? false;
  }

  getApiMessage(res: any) {
    return res.Message ?? res.message ?? '';
  }

  onPageChange(event: any): void {
    this.filterOptions.pagSize = Number(event.rows);
    this.filterOptions.pageNum = event.first / event.rows + 1;
    this.filterOptions = { ...this.filterOptions };
    this.refreshData();
  }
  nextPage() {
    this._router.navigate(['../billing'], { relativeTo: this._route });
  }
  ngOnDestroy(): void {
    this._matterService.updateMatter({
      ...this.formlyModel,
      law_MatterContactss: this.contacts,
    });
    this._unsubscribeService.destroy();
  }
}
