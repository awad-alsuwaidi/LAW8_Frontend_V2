import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Matter_Columns } from './matters-columns.config';
import {
  matter_stageConfig,
  matter_statusConfig,
} from './matter-status.config';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { MatterDto } from './interface/matter.interface';
import { SharedModule } from 'src/app/@shared/shared.module';
import { TooltipModule } from 'primeng/tooltip';
import { SharedStatusComponent } from '../../shared-status/shared-status.component';
import { SharedTableComponent } from '../../shared-table/shared-table.component';
import { SharedMatterFilterComponent } from './components/shared-matter-filter/shared-matter-filter.component';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { HighlightPipe } from 'src/app/@shared/pipes/highlight.pipe';
import { environment } from 'src/environments/environment';
import { ToastrNotifiService } from 'src/app/@core/services';

@Component({
  selector: 'app-shared-matter',
  standalone: true,
  imports: [
    SharedTableComponent,
    SharedStatusComponent,
    TooltipModule,
    SharedMatterFilterComponent,
    SharedModule,
    HighlightPipe,
  ],
  templateUrl: './shared-matter.component.html',
  styleUrls: ['./shared-matter.component.scss'],
})
export class SharedMatterComponent implements OnInit, OnDestroy {
  private _apiService = inject(ApiService);
  private _unsubscribeService = inject(UnsubscribeService);
  protected _route = inject(ActivatedRoute);
  protected _router = inject(Router);
  private _dynamicDialogConfig = inject(DynamicDialogConfig);
  private _dynamicDialogRef = inject(DynamicDialogRef);
  private _toastrNotifiService = inject(ToastrNotifiService);

  data: MatterDto[] = [];
  columns: any[] = Matter_Columns;
  statusConfig = matter_statusConfig;
  stageConfig = matter_stageConfig;
  @Input() first: number = 0;
  pagination: any = { pagSize: PAGESIZE, pageNum: 1, orderByDirection: 'ASC' };
  routeData: any;
  isLoading: boolean = false;
  activeTab: 'all' | 'favorites' = 'all';
  searchValue: string = '';
  identifier?: number;
  isInhouse = environment.brand === 'inhouse';

  activeFilters: any = {};

  @Input() set id(value: number) {
    this.identifier = value;
  }

  private filterSubject = new Subject<any>();

  ngOnInit(): void {
    this.activeTab = this._router.url.includes('favourite')
      ? 'favorites'
      : 'all';

    this.routeData =
      this._dynamicDialogConfig.data ||
      this._route.snapshot.data ||
      this._route.parent?.snapshot.data;

    this.getData();

    if (
      this._router.url.includes('clients') ||
      this._router.url.includes('timesheet')
    ) {
      this.columns = this.columns.filter((obj) => obj.field !== 'law_Client');
      this.columns = [...this.columns];
    }

    this.filterSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
        ),
        switchMap((params) => {
          this.isLoading = true;
          const endpoint = this.routeData['endpoint']?.get;

          return this._apiService
            .get(endpoint, params)
            .pipe(finalize(() => (this.isLoading = false)));
        }),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this.data =
              res.result?.items ||
              res.result?.dataList ||
              res.result?.data ||
              [];
            const total = Number(
              res.result?.totalCount ??
                res.result?.totalItems ??
                this.data.length,
            );
            this.pagination = { ...this.pagination, totalElements: total };
            this.first =
              (this.pagination.pageNum - 1) * this.pagination.pagSize;
          }
        },
      });

    this.columns = this.columns.map((col) => {
      if (col.isClient) {
        return {
          ...col,
          header: this.isInhouse ? 'matters.entity' : 'matters.client',
        };
      }
      return col;
    });
  }

  @Input() isTimesheet: boolean = false;

  loadAll() {
    this.activeTab = 'all';
    this.pagination = { ...this.pagination, pageNum: 1 };
    this.first = 0;
    this.refreshData();
  }

  loadFavorites() {
    this.activeTab = 'favorites';
    this.pagination = { ...this.pagination, pageNum: 1 };
    this.first = 0;
    this.refreshData();
  }

  private buildQueryParams(customFilters?: any): any {
    // ✅ الأساسيات دايماً موجودة
    const params: any = {
      pageNumber: this.pagination.pageNum,
      pageSize: this.pagination.pagSize,
      searchTerm: this.searchValue || '',
    };
    const isInactiveRoute = this._router.url.includes('inactive');
    params['isActive'] = !isInactiveRoute;

    if (this.pagination.orderBy) {
      params.sortBy = this.pagination.orderBy;
      params.isDescending = this.pagination.orderByDirection === 'DESC';
    }

    // favorites tab
    if (this.activeTab === 'favorites') {
      params['filters[isImportantForMe]'] = true;
    }

    const keyMap: any = {
      categoryId: 'matterCategoryId',
    };

    const filterKeys = [
      'clientId',
      'statusId',
      'matterCategoryId',
      'matterTypeId',
      'practiceAreaId',
      'branchId',
      'stageId',
      'jurisdictionId',
      'relatedToMatterId',
    ];

    const filters =
      customFilters !== undefined ? customFilters : this.activeFilters;

    if (filters) {
      Object.keys(filters).forEach((key) => {
        const value = filters[key];
        if (value === null || value === undefined || value === '') return;

        let finalValue = value;
        if (typeof value === 'object' && value?.id !== undefined) {
          finalValue = value.id;
        }

        if (key === 'search') {
          params.searchTerm = finalValue.trim().replace(/\s+/g, '*');
        } else {
          const apiKey = keyMap[key] || key;
          if (filterKeys.includes(apiKey)) {
            params[`filters[${apiKey}]`] = finalValue;
          } else if (apiKey !== 'pageNum' && apiKey !== 'pagSize') {
            params[apiKey] = finalValue;
          }
        }
      });
    }

    // ✅ الـ idKey (relatedToMatterId) لازم يتحول لـ filters[relatedToMatterId]
    if (this.identifier && this.routeData['idKey']) {
      const idKey = this.routeData['idKey'];
      if (filterKeys.includes(idKey)) {
        params[`filters[${idKey}]`] = this.identifier;
      } else {
        params[idKey] = this.identifier;
      }
    }

    return params;
  }
  onFilter(e: any) {
    this.activeFilters = e || {};
    this.searchValue = e?.search || '';

    this.pagination = { ...this.pagination, pageNum: 1 };
    this.first = 0;

    this.filterSubject.next(this.buildQueryParams());
  }

  getData() {
    this.isLoading = true;

    // 👇 بنقرأ الداتا من الـ Resolver سواء كانت في الروت الحالي أو الأب
    const resolvedData = 
      this._route.snapshot.data?.['data'] || 
      this._route.parent?.snapshot.data?.['data'];

    if (resolvedData) {
      this.data =
        resolvedData.result?.items ||
        resolvedData.result?.dataList ||
        [];
      
      this.pagination.totalElements =
        resolvedData.result?.totalCount ??
        resolvedData.result?.totalItems ??
        this.data.length;
        
      this.isLoading = false;
    } else {
      // لو مفيش داتا جاهزة (زي لما تفتح من Dialog)، هاتها
      this.refreshData();
    }
  }

  refreshData() {
    this.isLoading = true;
    const params = this.buildQueryParams();
    const endpoint = this.routeData['endpoint']?.get;

    of(null)
      .pipe(
        this._unsubscribeService.takeUntilDestroy(),
        switchMap(() => this._apiService.get(endpoint, params)),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this.data =
              res.result?.items ||
              res.result?.dataList ||
              res.result?.data ||
              [];
            const total = Number(
              res.result?.totalCount ??
                res.result?.totalItems ??
                this.data.length,
            );
            this.pagination = { ...this.pagination, totalElements: total };
            this.first =
              (this.pagination.pageNum - 1) * this.pagination.pagSize;
          }
        },
      });
  }

  onPageChange(e: any) {
    this.pagination = {
      ...this.pagination,
      pagSize: Number(e.rows),
      pageNum: Math.floor(e.first / e.rows) + 1,
    };
    this.first = e.first;
    this.refreshData(); // ✅ كان ناقص - مفيش request كانت بتتبعت
  }

  onSort(e: any) {
    const field = e.field;
    if (!field) return;

    this.pagination.orderBy = field;
    this.pagination.orderByDirection = e.order === -1 ? 'DESC' : 'ASC';

    this.pagination.pageNum = 1;
    this.first = 0;
    this.refreshData();
  }

  toggleFavourite(rowData: any) {
    const url = `${API_Config.matters.toggleImportant}/${rowData.id}/important`;

    this._apiService
      .patch(url, null)
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            rowData.isImportantForMe = !rowData.isImportantForMe;
            this._toastrNotifiService.displaySuccess(res.message);
          } else {
            this._toastrNotifiService.displayError(res.message);
          }
        },
        error: (err: any) => {
          const backendMessage = err?.error?.message || 'Something went wrong.';
          this._toastrNotifiService.displayError(backendMessage);
        },
      });
  }

  openInNewTab(id: number | string) {
    const baseRoute = this._router.url.includes('client')
      ? '/matters'
      : this.detectRoute();
    const url = this._router.serializeUrl(
      this._router.createUrlTree([baseRoute, id], { relativeTo: this._route }),
    );
    window.open('#' + url, '_blank');
  }

  detectRoute() {
    switch (true) {
      case this._router.url.includes('related-matters'):
        return '../../';
      case this._router.url.includes('favourite'):
        return '../';
      default:
        return './';
    }
  }

  onRowSelectChange(e: any) {
    if (this.routeData?.selectionMode) this._dynamicDialogRef.close(e);
  }

  ngOnDestroy(): void {
    this._unsubscribeService.destroy();
  }
}
