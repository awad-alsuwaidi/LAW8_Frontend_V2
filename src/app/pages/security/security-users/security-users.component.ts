import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SecurityUsersFilterComponent } from './components/security-users-filter/security-users-filter.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { User_Columns } from './security-users-columns.config';
import { SecurityUsersEditorComponent } from './components/security-users-editor/security-users-editor.component';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { ApiService } from 'src/app/@core/api/api.service';
import { finalize } from 'rxjs';
import { SecurityUserDto } from './interface/security-user.interface';
import { PermissionService } from 'src/app/@core/services/permission.service';

@Component({
  selector: 'app-security-users',
  standalone: true,
  imports: [
    TranslateModule,
    SecurityUsersFilterComponent,
    SharedTableComponent,
  ],
  templateUrl: './security-users.component.html',
  styleUrl: './security-users.component.scss',
})
export class SecurityUsersComponent {
  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _dialogService = inject(DialogService);
  protected _router = inject(Router);
  protected _route = inject(ActivatedRoute);
  protected data: SecurityUserDto[] = [];
  protected columns: any[] = User_Columns;
  protected pagination: any = {
    pagSize: 10,
    pageNum: 1,
    orderByDirection: 'ASC',
  };
  protected first!: number;
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
  _permissionService = inject(PermissionService);

  hasPermission(permission: string): boolean {
    return this._permissionService.hasPermission(permission);
  }

  
  getData() {
    this.isLoading = true;
    this._apiService
      .get(API_Config.userssecurity.get, this.pagination)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess) {
            this.data =
              res.result?.dataList?.map((user: SecurityUserDto) => ({
                ...user,
                groups: user.userGroups || [],
              })) || [];
            this.pagination.totalElements = res.result?.totalCount || 0;
            this.pagination = { ...this.pagination };
          
          }
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
  openSecurityUserEditor(rowData: SecurityUserDto) {
    const ref = this._dialogService.open(SecurityUsersEditorComponent, {
      width: '50vw',
      header: 'Add Group',
      data: { userId: rowData.id },
    });

    ref.onClose.subscribe((result) => {
      if (result) {
        this.getData();
      }
    });
  }
}
