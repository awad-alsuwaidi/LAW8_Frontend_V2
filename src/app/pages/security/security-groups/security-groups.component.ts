import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { Group_Columns } from './security-groups-columns.config';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { SecurityGroupsFilterComponent } from './components/security-groups-filter/security-groups-filter.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { ApiService } from 'src/app/@core/api/api.service';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { User_Group_API } from 'src/app/@core/api/api-config/security/userGroup';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-security-groups',
  standalone: true,
  imports: [
    SharedTableComponent,
    SecurityGroupsFilterComponent,
    TranslateModule,
    SharedButtonComponent,
    RouterModule,
  ],
  templateUrl: './security-groups.component.html',
  styleUrl: './security-groups.component.scss',
})
export class SecurityGroupsComponent implements OnInit {
  private _unsubscribe = inject(UnsubscribeService);
  private _dialogService = inject(DialogService);
  private _languageService = inject(LanguageService);
  private _toastrNotifiService = inject(ToastrNotifiService);
  protected _router = inject(Router);
  protected _route = inject(ActivatedRoute);
  protected data: any[] = [];
  protected columns: any[] = Group_Columns;
  protected pagination: any = {
    pagSize: PAGESIZE,
    pageNum: 1,
    orderByDirection: 'ASC',
  };
  protected first!: number;
  private _apiService = inject(ApiService);
  private deleteDialogRef!: DynamicDialogRef;
  protected roleId: string | null = null;

  protected isLoading!: boolean;
  ngOnInit(): void {
    this.getData();
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
    // this.data = Group_Data;
    this.isLoading = true;
    this._apiService
      .get(API_Config.groupSecurity.get, this.pagination)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.data = res.result.dataList;
            this.pagination.totalElements = res.result.totalCount;
            this.pagination = { ...this.pagination };
          }
        },
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
            'Are you sure you want to remove this Group?'
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

  _permissionService = inject(PermissionService);

  hasPermission(permission: string): boolean {
    return this._permissionService.hasPermission(permission);
  }
  deleteUserFromRole(userId: string) {
    this._apiService
      .post(`${User_Group_API.userGroup.deletee}?Id=${userId}`, {})
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
          //console.error('Error deleting user from role:', error);
          this._toastrNotifiService.displayError('Failed to remove user');
        },
      });
  }
}
