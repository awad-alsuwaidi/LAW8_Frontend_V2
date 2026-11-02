import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedModule } from 'src/app/@shared/shared.module';
import { Matter_Timesheet_Columns } from './matter-timesheet-columns.config';
import { MatterTimesheetDto } from 'src/app/pages/matters/interfaces/matter-timesheet.interface';
import { ApiService } from 'src/app/@core/api/api.service';
import { LanguageService } from 'src/app/@core/services';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-matter-timesheet',
  standalone: true,
  imports: [TableModule, SharedModule, PaginatorModule],
  templateUrl: './matter-timesheet.component.html',
  styleUrl: './matter-timesheet.component.scss',
})
export class MatterTimesheetComponent implements OnInit, OnDestroy {
  _permissionService = inject(PermissionService);
  _languageService = inject(LanguageService);
  _unsubscribeService = inject(UnsubscribeService);
  _apiService = inject(ApiService);
  _route = inject(ActivatedRoute);

  data: MatterTimesheetDto[] = [];
  totalRecords = 0;
  matterTimesheetColumns = Matter_Timesheet_Columns;
  isLoading = false;

  filterOptions = {
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'date',
    isDescending: true,
  };

  sortField = 'date';
  sortOrder = -1;

  private _matterIdentifier?: number;
  private _initialized = false;

  @Input() set id(value: number) {
    this._setMatterId(value);
  }
  @Input() set matterIdentifier(value: number) {
    this._setMatterId(value);
  }
  get matterIdentifier(): number | undefined {
    return this._matterIdentifier;
  }

  private _setMatterId(value: number | null | undefined): void {
    if (value == null) return;
    this._matterIdentifier = Number(value);
    if (this._initialized) {
      this.getData();
    }
  }

  get visibleColumns() {
    return this.matterTimesheetColumns.filter(
      (col) =>
        !col.requiredPermission ||
        this._permissionService.hasPermission(col.requiredPermission),
    );
  }

  hasPermission(permission: string): boolean {
    return this._permissionService.hasPermission(permission);
  }

  ngOnInit(): void {
    if (this._matterIdentifier == null) {
      const routeId =
        this._route.snapshot.paramMap.get('id') ??
        this._route.snapshot.paramMap.get('matterId');
      if (routeId) this._matterIdentifier = Number(routeId);
    }

    this._initialized = true;
    this.getData();
  }

  getData(): void {
    if (this._matterIdentifier == null) {
      this.data = [];
      this.totalRecords = 0;
      return;
    }

    this.isLoading = true;

    // ← الريكوست بيتبعت بالأسماء الجديدة مباشرة
    const params = {
      ...this.filterOptions,
      matterId: this._matterIdentifier,
    };

    this._apiService
      .get(API_Config.matterTimeSheet.get, params)
      .pipe(
        this._unsubscribeService.takeUntilDestroy(),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (!res?.isSuccess) {
            this.data = [];
            this.totalRecords = 0;
            return;
          }

          const r: any = res.result;

          const list: MatterTimesheetDto[] =
            (Array.isArray(r?.items) && r.items) ||
            (Array.isArray(r?.dataList) && r.dataList) ||
            (Array.isArray(r) && r) ||
            [];

          this.data = list;
          this.totalRecords = r?.totalCount ?? list.length;
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
        },
      });
  }

  onSort(event: any): void {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.filterOptions.sortBy = event.field;
    this.filterOptions.isDescending = event.order === -1;
    this.filterOptions.pageNumber = 1;
    this.getData();
  }

  onPageChange(event: PaginatorState): void {
    this.filterOptions.pageSize = Number(event.rows);
    this.filterOptions.pageNumber = (event.first ?? 0) / (event.rows ?? 0) + 1;
    this.getData();
  }

  ngOnDestroy(): void {
    this._unsubscribeService.destroy();
  }
}
