import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { TranslateModule } from '@ngx-translate/core';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { SgAssignedUsersEditorComponent } from './components/sg-assigned-users-editor/sg-assigned-users-editor.component';
import { Users_Group_Columns } from './security-groups-assigned-users-columns.config';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { ApiService } from 'src/app/@core/api/api.service';
import { User_Group_API } from 'src/app/@core/api/api-config/security/userGroup';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { finalize } from 'rxjs';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { PermissionService } from 'src/app/@core/services/permission.service';

@Component({
  selector: 'app-security-groups-assigned-users',
  standalone: true,
  imports: [
    SharedModule,
    SharedTableComponent,
    SharedButtonComponent,
    BreadcrumbModule,
  ],
  templateUrl: './security-groups-assigned-users.component.html',
  styleUrl: './security-groups-assigned-users.component.scss',
})
export class SecurityGroupsAssignedUsersComponent implements OnInit {
  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _dialogService = inject(DialogService);
  private _languageService = inject(LanguageService);
  protected _router = inject(Router);
  protected _route = inject(ActivatedRoute);
  _unsubscribeService = inject(UnsubscribeService);
  _dynamicDialogConfig = inject(DynamicDialogConfig);
  _dynamicDialogRef = inject(DynamicDialogRef);
  _toastrNotifiService = inject(ToastrNotifiService);
  private deleteDialogRef!: DynamicDialogRef;

  protected data: any[] = [];
  breadcrumbItems: MenuItem[] | undefined;

  protected columns: any[] = Users_Group_Columns;
  protected pagination: any = {
    pagSize: PAGESIZE,
    pageNum: 1,
    orderByDirection: 'ASC',
  };
  protected first!: number;
  protected isLoading: boolean = false;
  protected roleId: string | null = null;
  _permissionService = inject(PermissionService);
  
  hasPermission(permission: string): boolean {
    return this._permissionService.hasPermission(permission);
  }
  ngOnInit(): void {
    this._route.params.subscribe((params) => {
      this.roleId = params['groupIdentifier'];
      if (this.roleId) this.getData();
    });
    this.breadcrumbItems = [
      {
        label: this._languageService.getTransValue('Groups'),
        routerLink: '/security/groups',
      },
      {
        label: this._languageService.getTransValue('Assigned Users'),
      },
    ];
  }

  onFilter(e: any) {
    this.pagination.search = e.search;
    this.pagination.pageNum = 1;
    this.getData();
  }

  onPageChange(e: any) {
    this.pagination.pagSize = Number(e.rows);
    this.pagination.pageNum = e.first / e.rows + 1;
    this.first = e.first;
    this.getData();
  }

  getData() {
    if (!this.roleId) return;

    const requestParams = {
      ...this.pagination,
      roleId: this.roleId,
    };

    this.isLoading = true;
    this._apiService
      .get(User_Group_API.userGroup.getRoleUsersList, requestParams)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res) => {
          if (res?.isSuccess) {
            this.data =
              res.result?.dataList?.map((user: any) => ({
                ...user,
                assignedGroups: user.userGroups || [],
              })) || [];
            this.pagination.totalElements = res.result?.totalCount || 0;
            this.pagination = { ...this.pagination };
          }
        },
      });
  }

  openAssignUsersEditor() {
    if (!this.roleId) return;

    const ref = this._dialogService.open(SgAssignedUsersEditorComponent, {
      header: this._languageService.getTransValue('Add User'),
      width: '50%',
      data: {
        formlyModel: {},
        roleId: this.roleId,
      },
      styleClass: 'p-fluid',
    });

    ref.onClose.subscribe((result) => {
      if (result?.success) {
        setTimeout(() => this.getData(), 100);
      }
    });
  }

  onDelete(rowData: any) {
    this.deleteDialogRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        modal: true,
        styleClass: 'w-[400px]',
        data: {
          type: ConfirmDialogType.Danger,
          title: this._languageService.getTransValue('users.deleteUserTitle', {
            value: rowData?.fullName || rowData?.name,
          }),
          message: this._languageService.getTransValue(
            'users.deleteUserMessage'
          ),
          btns: [
            {
              label: this._languageService.getTransValue('lookups.discard'),
              styleClass: 'border border-grey500 text-grey500',
              command: () => this.deleteDialogRef?.close(),
            },
            {
              label: this._languageService.getTransValue('lookups.delete'),
              styleClass: 'bg-textErrorBase text-white',
              command: () => this.deleteUserFromRole(rowData.id),
            },
          ],
        },
      }
    );
  }
  deleteUserFromRole(userId: string) {
    this._apiService
      .post(
        `${User_Group_API.userGroup.delete}?RoleId=${this.roleId}&UserId=${userId}`,
        {}
      )
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess) {
            if (this.data.length === 1) this.pagination.pageNum--;
            this.getData();
            this._toastrNotifiService.displaySuccess(
              res.message || 'User removed successfully'
            );
            this.deleteDialogRef?.close();
          }
        },
        error: (error) => {
          this._toastrNotifiService.displayError('Failed to remove user');
        },
      });
  }

  onSort(e: any) {
 
    if (!e || !e.field) {
      return;
    }

    const newOrderBy = e.field;
    const newOrderByDirection = e.order === 1 ? 'ASC' : 'DSC'; 

    if (
      this.pagination.orderBy === newOrderBy &&
      this.pagination.orderByDirection === newOrderByDirection
    ) {
      return;
    }

    this.pagination.orderBy = newOrderBy;
    this.pagination.orderByDirection = newOrderByDirection;
    this.pagination.pageNum = 1; 
    this.first = 0;

    this.getData();
  }
}
