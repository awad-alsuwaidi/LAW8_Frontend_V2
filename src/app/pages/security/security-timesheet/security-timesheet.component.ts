import { Component, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SECURITY_TIMESHEET } from './security-timesheet-columns.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { finalize } from 'rxjs';
import { SecurityTimesheetFilterEditorComponent } from './components/security-timesheet-filter-editor/security-timesheet-filter-editor.component';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { PermissionService } from 'src/app/@core/services/permission.service';

@Component({
  selector: 'app-security-timesheet',
  standalone: true,
  imports: [
    SharedTableComponent,
    SharedModule,
    SharedButtonComponent,
    SecurityTimesheetFilterEditorComponent,
  ],
  templateUrl: './security-timesheet.component.html',
  styleUrl: './security-timesheet.component.scss',
})
export class SecurityTimesheetComponent implements OnDestroy {
  private _unsubscribe = inject(UnsubscribeService);
  private _apiService = inject(ApiService);
  protected _router = inject(Router);
  protected _route = inject(ActivatedRoute);
  _languageService = inject(LanguageService);
  _toastrNotifiService = inject(ToastrNotifiService);
  private _permissionService = inject(PermissionService);

  protected data: any[] = [];
  protected columns: any[] = [];
  protected pagination: any = {
    pagSize: PAGESIZE,
    pageNum: 1,
    orderByDirection: 'ASC',
  };
  protected first!: number;
  protected isLoading!: boolean;
  protected isSubmitted!: boolean;
  protected updatedRows: any[] = [];
  protected canUpdateTimesheet = false;

  constructor() {
    // 👇 تحقق من البيرميشن
    this.canUpdateTimesheet = this._permissionService.hasPermission('Update_Security_Timesheet');

    // 👇 لو معهوش بيرميشن نخفي الأعمدة View و Add
    this.columns = SECURITY_TIMESHEET.filter(col => {
      if (!this.canUpdateTimesheet && ['view', 'add'].includes(col.field)) {
        return false;
      }
      return true;
    });
  }

  onFilter(e: any) {
    this.pagination = { ...this.pagination, ...e };
    this.getData();
  }

  onCheck(e: any) {
    let row = e;
    let rowIndex = this.updatedRows.findIndex((obj) => obj == row);
    if (rowIndex != -1) {
      this.updatedRows[rowIndex] = row;
    } else {
      this.updatedRows.push(row);
    }
  }

  onPageChange(e: any) {
    this.pagination.pagSize = Number(e.rows);
    this.pagination.pageNum = e.first / e.rows + 1;
    this.first = e?.first;
    this.getData();
  }

  onSort(e: any) {
    if (!e || !e.field) return;

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

  getData() {
    if (!this.pagination.userId) return;
    this.isLoading = true;
    this._apiService
      .get(API_Config.timesheetSecurity.get, this.pagination)
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

  onSubmit() {
    let model = {
      userId: this.pagination?.userId,
      tmsList: this.updatedRows.map((item) => ({
        userId: item.id,
        add: item.add,
        view: item.view,
      })),
    };
    this.isSubmitted = true;
    this._apiService
      .post(API_Config.timesheetSecurity.update, model)
      .pipe(
        finalize(() => (this.isSubmitted = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: () => {
          const text = this._languageService.getTransValue('messages.updateSuccessfully');
          this._toastrNotifiService.displaySuccess(text);
        },
      });
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
