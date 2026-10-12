import { Component, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SECURITY_CALENDAR } from './security-calendar-columns.config';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { SecurityTimesheetFilterEditorComponent } from '../security-timesheet/components/security-timesheet-filter-editor/security-timesheet-filter-editor.component';
import { PermissionService } from 'src/app/@core/services/permission.service';

@Component({
  selector: 'app-security-calendar',
  standalone: true,
  imports: [
    SharedTableComponent,
    SharedModule,
    SharedButtonComponent,
    SecurityTimesheetFilterEditorComponent,
  ],
  templateUrl: './security-calendar.component.html',
  styleUrl: './security-calendar.component.scss',
})
export class SecurityCalendarComponent implements OnDestroy {
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
  protected canUpdateCalendar = false;

  constructor() {
    this.canUpdateCalendar = this._permissionService.hasPermission('Update_Security_Calendar');

    this.columns = SECURITY_CALENDAR.filter(col => {
      if (!this.canUpdateCalendar && ['view', 'edit', 'private'].includes(col.field)) {
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

  getData() {
    if (!this.pagination.userId) return;
    this.isLoading = true;
    this._apiService
      .get(API_Config.calendarSecurity.get, this.pagination)
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
        edit: item.edit,
        private: item.private,
        view: item.view,
      })),
    };
    this.isSubmitted = true;
    this._apiService
      .post(API_Config.calendarSecurity.update, model)
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
