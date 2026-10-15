import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { UserDto } from '../interfaces/user.interface';
import { Users_Columns } from './users-view-list-columns.config';
import { UsersToggleViewComponent } from '../components/users-toggle-view/users-toggle-view.component';
import { SharedSearchComponent } from 'src/app/@shared/components/shared-search/shared-search.component';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { finalize } from 'rxjs';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { DialogService } from 'primeng/dynamicdialog';
import { ResetPasswordEditorComponent } from '../user-details/components/reset-password-editor/reset-password-editor.component';
import { UsersTimesheetEditorComponent } from '../components/users-timesheet-editor/users-timesheet-editor.component';
import { LanguageService } from 'src/app/@core/services';
import { SortEvent } from 'primeng/api';
import { Subject, debounceTime, switchMap } from 'rxjs'; // ★

@Component({
  selector: 'app-users-view-list',
  standalone: true,
  imports: [
    SharedTableComponent,
    SharedButtonComponent,
    RouterModule,
    SharedModule,
    UsersToggleViewComponent,
    SharedSearchComponent,
    UsersTimesheetEditorComponent,
  ],
  templateUrl: './users-view-list.component.html',
  styleUrl: './users-view-list.component.scss',
})
export class UsersViewListComponent implements OnInit, OnDestroy {
  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _dialogService = inject(DialogService);
  private Language = inject(LanguageService);

  // ★ Subject للـ debounce
  private refresh$ = new Subject<void>();

  data: UserDto[] = [];
  isLoading = false;

  pagination: any = {
    pageNum: 1,
    pagSize: PAGESIZE,
    orderByDirection: 'ASC',
    sortBy: 'id', // ★
    isDescending: false, // ★
    filters: {},
  };

  userPermissions: string[] = ['Unlock_Users', 'Deactivate_Users'];
  columns: any[] = [];
  usersData = [];

  // ============================================================
  // ★ ngOnInit — debounce + switchMap
  // ============================================================
  ngOnInit(): void {
    this.refresh$
      .pipe(
        debounceTime(50),
        switchMap(() => {
          const params = {
            pageNum: this.pagination.pageNum,
            pagSize: this.pagination.pagSize,
            sortBy: this.pagination.sortBy,
            isDescending: this.pagination.isDescending,
            search: this.pagination.search,
          };
          return this._apiService.get(API_Config.users.get, params);
        }),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => this.handleResponse(res),
        error: (err) => {
          console.error('❌ fetch users failed:', err);
          this.isLoading = false;
        },
      });

    this.columns = Users_Columns.filter((col) => {
      if (col.permission) {
        return this.userPermissions.includes(col.permission);
      }
      return true;
    });

    this.triggerRefresh();
  }

  // ============================================================
  // ★ triggerRefresh
  // ============================================================
  private triggerRefresh(): void {
    this.isLoading = true;
    this.refresh$.next();
  }

  // ============================================================
  // ★ handleResponse
  // ============================================================
  private handleResponse(res: any): void {
    const body = res?.data ?? res?.result ?? {};
    const items: any[] = body?.items ?? body?.dataList ?? [];

    this.data = items.map((obj: any) => ({
      id: obj.id,
      userName: obj.userName,
      nameEn: obj.nameEn,
      nameAr: obj.nameAr,
      name: obj.nameEn ?? obj.nameAr ?? obj.userName ?? '',
      email: obj.email,
      phoneNumber: obj.phoneNumber,
      phone: obj.phone ?? obj.phone ?? null,
      active: obj.active,
      locked: obj.locked,
      profileImageUrl: obj.profileImageUrl,
      roles: obj.roles,
      timesheetDate: obj.timesheetDate ?? obj.createdAtUtc,
      code: obj.code ?? obj.code ?? null,
      titleName: obj.titleName ?? null,
      departmentName: obj.departmentName ?? null,
    })) as any;

    this.pagination.totalElements = body?.totalCount ?? 0;
    this.pagination = { ...this.pagination };
    this.isLoading = false;
  }

  // ============================================================
  // Search
  // ============================================================
  searchValueChange(value: string): void {
    this.pagination.search = value;
    this.pagination.pageNum = 1;
    this.pagination = { ...this.pagination };
    this.triggerRefresh();
  }

  // ============================================================
  // Sort
  // ============================================================
  onSortChange(event: SortEvent): void {
    this.pagination.sortBy = event.field;
    this.pagination.isDescending = event.order === -1;
    this.pagination.pageNum = 1;
    this.pagination = { ...this.pagination };
    this.triggerRefresh();
  }

  // ============================================================
  // Pagination
  // ============================================================
  onPageChange(event: any): void {
    this.pagination.pagSize = Number(event.rows);
    this.pagination.pageNum = event.first / event.rows + 1;
    this.pagination = { ...this.pagination };
    this.triggerRefresh();
  }

  // ============================================================
  // Toggle Switches
  // ============================================================
  onToggleSwitch(e: any) {
    switch (e.col) {
      case 'active':
        this.toggleActiveUser(e.rowData, e.value);
        break;
      case 'locked':
        this.toggleLockedUser(e.rowData, e.value);
        break;
    }
  }

  toggleActiveUser(rowData: UserDto, activation: boolean) {
    const title = activation
      ? this.Language.getTransValue('users.activate')
      : this.Language.getTransValue('users.Deactivate');
    const message = activation
      ? this.Language.getTransValue('users.confirmActivateMessage')
      : this.Language.getTransValue('users.confirmDeactivateMessage');

    const ref: any = this._dialogService.open(SharedConfirmDialogComponent, {
      data: {
        type: activation ? ConfirmDialogType.Success : ConfirmDialogType.Danger,
        title,
        message,
        btns: [
          {
            label: this.Language.getTransValue('common.cancel'),
            styleClass: 'border border-grey500 text-grey500',
            command: () => {
              rowData.active = !activation;
              ref.close();
            },
          },
          {
            label: title,
            styleClass: activation
              ? 'bg-primary text-white'
              : 'bg-textErrorBase text-white',
            command: () => {
              this._apiService
                .post(
                  `${API_Config.users.toggleActive}/${rowData.id}/toggle-active`,
                  {},
                )
                .pipe(this._unsubscribe.takeUntilDestroy())
                .subscribe({
                  next: () => {
                    ref.close(true);
                    this.triggerRefresh();
                  },
                  error: (err: any) => {
                    rowData.active = !activation;
                    console.error(err);
                  },
                });
            },
          },
        ],
      },
    });
  }
onFilterChange(filter: any): void {
  this.pagination.filters = filter;
  this.pagination.pageNum = 1;
  this.pagination = { ...this.pagination };
  this.triggerRefresh();
}
  toggleLockedUser(rowData: UserDto, locked: boolean) {
    const title = locked
      ? this.Language.getTransValue('users.Locked')
      : this.Language.getTransValue('users.unLocked');

    const message = locked
      ? this.Language.getTransValue('users.confirmLockMessage')
      : this.Language.getTransValue('users.confirmUnlockMessage');

    const ref: any = this._dialogService.open(SharedConfirmDialogComponent, {
      data: {
        type: locked ? ConfirmDialogType.Success : ConfirmDialogType.Danger,
        title,
        message,
        btns: [
          {
            label: this.Language.getTransValue('users.Cancel'),
            styleClass: 'border border-grey500 text-grey500',
            command: () => {
              rowData.locked = !locked;
              ref.close();
            },
          },
          {
            label: title,
            styleClass: locked
              ? 'bg-primary text-white'
              : 'bg-textErrorBase text-white',
            command: () => {
              this._apiService
                .post(
                  `${API_Config.users.toggleLock}/${rowData.id}/toggle-lock`,
                  {},
                )
                .pipe(this._unsubscribe.takeUntilDestroy())
                .subscribe({
                  next: () => {
                    ref.close(true);
                    this.triggerRefresh();
                  },
                  error: (err: any) => {
                    rowData.locked = !locked;
                    console.error(err);
                  },
                });
            },
          },
        ],
      },
    });
  }

  openResetPasswordEditor(rowData: UserDto) {
    this._dialogService.open(ResetPasswordEditorComponent, {
      header: this.Language.getTransValue('users.resetPassword'),
      width: '30vw',
      data: { userId: rowData.id },
    });
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
