import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SharedButtonComponent } from '../../shared-button/shared-button.component';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
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
import { Subject, debounceTime, switchMap } from 'rxjs';

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
  pageNumber: 1,
  pageSize: 10,
  sortBy: '',
  isDescending: false,
};

  formlyModel: any;
  getFormsData = effect(() => {
    if (!this._router.url.includes('/matters')) return;

    const matter = this._matterService.getMatter();
    if (!matter) return;

    this.formlyModel = matter;
    if (matter?.law_MatterContactss?.length) {
      this.contacts = [...matter.law_MatterContactss];
    }
    if (!matter.practsAreaId && this._router.url.includes('add')) {
      this._router.navigate(['/matters/add']);
    }
  });

  emptyConfig?: EmptyConfig;
  ngOnInit(): void {
    this.routeData = this._route.snapshot.data;

    this.initRefreshStream(); 

    this.emptyConfig = {
      messageTitle: this._languageService.getTransValue(
        'clients.noContactsTitle',
      ),
      description: this._languageService.getTransValue(
        'clients.noContactsDescription',
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
onPageChange(event: any): void {
  this.filterOptions.pageSize = Number(event.rows);
  this.filterOptions.pageNumber = event.first / event.rows + 1;
  this.filterOptions = { ...this.filterOptions };
  this.refreshData();
}
onSort(field: string) {
  if (!field) return;

  if (this.filterOptions.sortBy === field) {
    this.filterOptions.isDescending = !this.filterOptions.isDescending;
  } else {
    this.filterOptions.sortBy = field;
    this.filterOptions.isDescending = false;
  }

  this.filterOptions.pageNumber = 1;
  this.refreshData();
}
handleSort(event: any) {
  if (!event?.field) return;

  this.filterOptions.sortBy = event.field;
  this.filterOptions.isDescending = event.order === -1;

  this.filterOptions.pageNumber = 1;
  this.refreshData();
}
loadData(event: any) {
  this.filterOptions.pageNumber = event.first / event.rows + 1;
  this.filterOptions.pageSize = event.rows;

  if (event.sortField) {
    this.filterOptions.sortBy = event.sortField;
    this.filterOptions.isDescending = event.sortOrder === -1;
  }

  this.refreshData();
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
          this.routeData['permission'],
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
          this.routeData['editPermission'],
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
          this.routeData['deletePermission'],
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
        this.forceRefresh();
      }
    });
  }

  getApiResult(res: any) {
    return res?.data ?? res?.Data ?? res?.result ?? res?.Result ?? {};
  }

  getApiSuccess(res: any) {
    return res?.success === true || res?.isSuccess === true;
  }

  getApiMessage(res: any) {
    return res?.message ?? res?.Message ?? '';
  }

  private refresh$ = new Subject<void>();
  private lastRequestKey = '';

  refreshData(): void {
    this.refresh$.next();
  }

  forceRefresh(): void {
    this.lastRequestKey = '';
    this.refresh$.next();
  }

private initRefreshStream(): void {
  this.refresh$
    .pipe(
      debounceTime(0),
      switchMap(() => {
        const filterKey =
          this.routeData['filterKey'] ?? this.routeData['idKey'];

        this.filterOptions = {
          ...this.filterOptions,
          [filterKey]: this.id,
        };

        const key = JSON.stringify(this.filterOptions);
        if (key === this.lastRequestKey) return [];
        this.lastRequestKey = key;

        return this._apiService.get(
          this.routeData['endpoint'].get,
          this.filterOptions,
        );
      }),
      this._unsubscribeService.takeUntilDestroy(),
    )
      .subscribe({
        next: (res: any) => {
          if (!res) return;
          if (!this.getApiSuccess(res)) return;

          const result = this.getApiResult(res);
          const items = result?.items ?? result?.dataList ?? [];

          this.contacts = items.map((person: any) => {
            const normalized: any = {};
            for (const key in person) {
              normalized[key] = person[key] == null ? '' : person[key];
            }
            normalized.fullName = [
              person.firstName,
              person.middleName,
              person.lastName,
            ]
              .filter(Boolean)
              .join(' ')
              .trim();
            normalized.phone = person.phone1 ?? person.phone ?? '';
            normalized.mobile = person.mobile1 ?? person.mobile ?? '';
            normalized.email = person.email ?? '';
            return normalized;
          });

          this.totalRecords = result?.totalCount ?? 0;
        },
      });
  }

  getParams() {
    this._route.params
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe({
        next: (params: Params) => {
          if (params['id']) this.id = params['id'];
          this.refreshData();
        },
      });
  }

  onDelete() {
    const confirmDeleteRef: DynamicDialogRef = this._dialogService.open(
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
              command: () => confirmDeleteRef.close(),
            },
            {
              label: 'Delete',
              styleClass: 'bg-textErrorBase text-white',
              command: () => confirmDeleteRef.close(true),
            },
          ],
        },
      },
    );

    confirmDeleteRef.onClose.subscribe({
      next: (res) => {
        if (!res) return;

        if (this._router.url.includes('add')) {
          this.contacts = this.contacts.filter(
            (obj) => obj !== this.selectedRow,
          );
          this.totalRecords = this.contacts.length;
          return;
        }

        const url = `${this.routeData['endpoint'].delete}/${this.selectedRow.id}`;

        this._apiService
          .delete(url)
          .pipe(this._unsubscribeService.takeUntilDestroy())
          .subscribe({
            next: (res: any) => {
              if (this.getApiSuccess(res)) {
                this._toastrNotifiService.displaySuccess(
                  this.getApiMessage(res),
                );
                this.forceRefresh();
              } else {
                this._toastrNotifiService.displayError(this.getApiMessage(res));
              }
            },
            error: (err: any) => {
              this._toastrNotifiService.displayError(
                err?.error?.message ?? 'Delete failed',
              );
            },
          });
      },
    });
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
