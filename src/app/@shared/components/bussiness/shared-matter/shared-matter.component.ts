// import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Matter_Columns } from './matters-columns.config';
// import { matter_statusConfig } from './matter-status.config';
// import { PAGESIZE } from 'src/app/@core/utilities/defines';
// import {
//   debounceTime,
//   distinctUntilChanged,
//   finalize,
//   of,
//   Subject,
//   switchMap,
// } from 'rxjs';
// import { API_Config } from 'src/app/@core/api/api-config/api.config';
// import { ApiService } from 'src/app/@core/api/api.service';
// import { ApiRes } from 'src/app/@core/models/apiRes-model';
// import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
// import { MatterDto } from './interface/matter.interface';
// import { SharedModule } from 'src/app/@shared/shared.module';
// import { TooltipModule } from 'primeng/tooltip';
// import { SharedStatusComponent } from '../../shared-status/shared-status.component';
// import { SharedTableComponent } from '../../shared-table/shared-table.component';
// import { SharedMatterFilterComponent } from './components/shared-matter-filter/shared-matter-filter.component';
// import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
// import { HighlightPipe } from 'src/app/@shared/pipes/highlight.pipe';

// @Component({
//   selector: 'app-shared-matter',
//   standalone: true,
//   imports: [
//     SharedTableComponent,
//     SharedStatusComponent,
//     TooltipModule,
//     SharedMatterFilterComponent,
//     SharedModule,
//     HighlightPipe,
//   ],
//   templateUrl: './shared-matter.component.html',
//   styleUrls: ['./shared-matter.component.scss'],
// })
// export class SharedMatterComponent implements OnInit, OnDestroy {
//   private _apiService = inject(ApiService);
//   private _unsubscribeService = inject(UnsubscribeService);
//   protected _route = inject(ActivatedRoute);
//   protected _router = inject(Router);
//   private _dynamicDialogConfig = inject(DynamicDialogConfig);
//   private _dynamicDialogRef = inject(DynamicDialogRef);

//   data: MatterDto[] = [];
//   columns: any[] = Matter_Columns;
//   statusConfig = matter_statusConfig;
//   @Input() first: number = 0;
//   pagination: any = { pagSize: PAGESIZE, pageNum: 1, orderByDirection: 'ASC' };
//   routeData: any;

//   isLoading: boolean = false;

//   @Input() set id(value: number) {
//     this.identifier = value;
//   }
//   identifier?: number;

//   private filterSubject = new Subject<any>();
//   ngOnInit(): void {
//     this.routeData =
//       this._dynamicDialogConfig.data || this._route.snapshot.data;
//     this.getData();

//     if (
//       this._router.url.includes('clients') ||
//       this._router.url.includes('timesheet')
//     ) {
//       this.columns = this.columns.filter((obj) => obj.field !== 'law_Client');
//       this.columns = [...this.columns];
//     }

//     this.filterSubject
//       .pipe(
//         debounceTime(400),
//         distinctUntilChanged(),
//         switchMap((e) => {
//           this.isLoading = true;
//           return this._apiService
//             .get(this.routeData['endpoint']?.get, e)
//             .pipe(finalize(() => (this.isLoading = false)));
//         })
//       )
//       .subscribe({
//         next: (res: ApiRes) => {
//           if (res.isSuccess) {
//             this.data = res.result.dataList || [];
//             const total = Number(res.result.totalCount ?? 0);
//             this.pagination = { ...this.pagination, totalElements: total };
//             this.first =
//               (this.pagination.pageNum - 1) * this.pagination.pagSize;
//             console.log('✅ Filter applied — Total:', total);
//           }
//         },
//       });
//   }

//   @Input() isTimesheet: boolean = false;

//   getData() {
//     this.isLoading = true;

//     if (this._route.snapshot.data['data']) {
//       this.data = this._route.snapshot.data['data'].result.dataList;
//       this.pagination.totalElements =
//         this._route.snapshot.data['data'].result.totalCount;
//       this.isLoading = false;
//     } else {
//       this.refreshData();
//     }
//   }

//   filterBySearch(data: any[], searchValue: string) {
//     const searchWords = searchValue.trim().toLowerCase().split(/\s+/);
//     return data.filter((item) =>
//       searchWords.every((word) =>
//         JSON.stringify(item).toLowerCase().includes(word)
//       )
//     );
//   }

//   filterUndefinedValues(obj: any) {
//     return Object.fromEntries(
//       Object.entries(obj).filter(
//         ([key, v]) =>
//           (v !== undefined && v !== null) ||
//           ['pageNum', 'pagSize', 'orderBy', 'orderByDirection'].includes(key)
//       )
//     );
//   }

//   onPageChange(e: any) {
//     console.log('--- onPageChange called ---');
//     console.log('Event:', e);

//     const newPagination = {
//       ...this.pagination,
//       pagSize: Number(e.rows),
//       pageNum: e.first / e.rows + 1,
//     };
//     this.pagination = this.filterUndefinedValues(newPagination);
//     this.first = e.first;

//     console.log('New pagination after page change:', this.pagination);

//     this.refreshData();
//   }

//   refreshData() {
//     this.isLoading = true;

//     // ✅ نوقف أي call سابق
//     this._unsubscribeService.destroy();

//     of(null)
//       .pipe(
//         this._unsubscribeService.takeUntilDestroy(),
//         switchMap(() =>
//           this._apiService.get(this.routeData['endpoint']?.get, this.pagination)
//         ),
//         finalize(() => (this.isLoading = false))
//       )
//       .subscribe({
//         next: (res: ApiRes) => {
//           if (res.isSuccess) {
//             this.data = res.result.dataList || [];

//             const newTotal = Number(res.result.totalCount ?? 0);
//             if (!isNaN(newTotal)) {
//               this.pagination = { ...this.pagination, totalElements: newTotal };
//             }

//             this.first =
//               (this.pagination.pageNum - 1) * this.pagination.pagSize;

//             console.log('Updated first after API:', this.first);
//             console.log(
//               'Total elements after API:',
//               this.pagination.totalElements
//             );
//           }
//         },
//       });
//   }

//   onFilter(e: any) {
//     console.log('--- onFilter called ---');
//     console.log('Filter event:', e);

//     const rawSearch = e?.search?.trim() ?? '';
//     this.searchValue = rawSearch;
//     const isTimesheet = this._router.url.includes('timesheet');

//     let newPagination: any;

//     if (!rawSearch) {
//       console.log('Filter cleared → resetting pagination...');
//       newPagination = {
//         pagSize: PAGESIZE,
//         pageNum: 1,
//         orderByDirection: 'ASC',
//         ...(isTimesheet && this.identifier
//           ? { [this.routeData['idKey']]: this.identifier }
//           : {}),
//       };
//     } else {
//       const formattedSearch = rawSearch.replace(/\s+/g, '*');
//       newPagination = {
//         ...this.pagination,
//         search: formattedSearch,
//         clientId: e?.clientId?.id ?? null,
//         practiceAreaId: e?.practiceAreaId?.id ?? null,
//         categoryId: e?.categoryId?.id ?? null,
//         matterTypeId: e?.matterTypeId?.id ?? null,
//         statusId: e?.statusId?.id ?? null,
//         pageNum: 1,
//         ...(isTimesheet && this.identifier
//           ? { [this.routeData['idKey']]: this.identifier }
//           : {}),
//       };
//     }

//     this.pagination = this.filterUndefinedValues(newPagination);
//     this.first = 0;

//     // ✅ نبعث الباجينيشن الجديد للـ Subject علشان يتنفذ بعد debounce
//     this.filterSubject.next(this.pagination);
//   }

//   searchValue: string = '';

//   onSort(e: any) {
//     if (!e || !e.field) return;

//     const newOrderBy = e.field;
//     const newOrderByDirection = e.order === 1 ? 'ASC' : 'DSC';

//     if (
//       this.pagination.orderBy === newOrderBy &&
//       this.pagination.orderByDirection === newOrderByDirection
//     )
//       return;

//     this.pagination = {
//       ...this.pagination,
//       orderBy: newOrderBy,
//       orderByDirection: newOrderByDirection,
//       pageNum: 1,
//     };
//     this.first = 0;
//     this.refreshData();
//   }

//   toggleFavourite(rowData: MatterDto) {
//     const payload = { matterId: rowData.id };
//     this._apiService
//       .post(API_Config.matters.importentMatter, null, payload)
//       .pipe(this._unsubscribeService.takeUntilDestroy())
//       .subscribe({
//         next: (res: ApiRes) => {
//           if (res.isSuccess) rowData.isImportent = !rowData.isImportent;
//         },
//       });
//   }

//   openInNewTab(id: number | string) {
//     const baseRoute = this._router.url.includes('client')
//       ? '/matters'
//       : this.detectRoute();
//     const url = this._router.serializeUrl(
//       this._router.createUrlTree([baseRoute, id], { relativeTo: this._route })
//     );
//     window.open('#' + url, '_blank');
//   }

//   detectRoute() {
//     switch (true) {
//       case this._router.url.includes('related-matters'):
//         return '../../';
//       case this._router.url.includes('favourite'):
//         return '../';
//       default:
//         return './';
//     }
//   }

//   onRowSelectChange(e: any) {
//     if (this.routeData?.selectionMode) this._dynamicDialogRef.close(e);
//   }

//   ngOnDestroy(): void {
//     this._unsubscribeService.destroy();
//   }
// }

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

  @Input() set id(value: number) {
    this.identifier = value;
  }

  private filterSubject = new Subject<any>();

  ngOnInit(): void {
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
        distinctUntilChanged(),
        switchMap((e) => {
          this.isLoading = true;

          const endpoint =
            this.activeTab === 'favorites'
              ? 'DashboardV2/GetImportentMatterList'
              : this.routeData['endpoint']?.get;

          return this._apiService
            .get(endpoint, e)
            .pipe(finalize(() => (this.isLoading = false)));
        }),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this.data = res.result?.dataList || [];
            const total = Number(res.result?.totalCount ?? this.data.length);
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
    this.refreshData();
  }

  loadFavorites() {
    this.activeTab = 'favorites';
    this.pagination = { ...this.pagination, pageNum: 1 };
    this.refreshData();
  }
  onFilter(e: any) {
    console.log('Filter received:', e);
    if (!e || Object.keys(e).length === 0) {
      this.pagination = {
        pagSize: PAGESIZE,
        pageNum: 1,
        orderByDirection: 'ASC',
        orderBy: this.pagination.orderBy || null,
      };
      this.first = 0;
      this.filterSubject.next({
        ...this.pagination,
        [this.routeData['idKey']]: this.identifier,
      });
      return;
    }
    const cleanFilters: any = {};

    Object.keys(e).forEach((key) => {
      const value = e[key];

      if (value === null || value === undefined || value === '') return;

      if (typeof value === 'object' && value?.id !== undefined) {
        cleanFilters[key] = value.id;
      } else {
        cleanFilters[key] = value;
      }
    });

    if (cleanFilters.search) {
      cleanFilters.search = cleanFilters.search.trim().replace(/\s+/g, '*');
    }
    this.pagination = {
      pagSize: this.pagination.pagSize,
      pageNum: 1,
      orderBy: this.pagination.orderBy || null,
      orderByDirection: this.pagination.orderByDirection || 'ASC',
      ...cleanFilters,
    };

    this.first = 0;
    this.filterSubject.next({
      ...this.pagination,
      [this.routeData['idKey']]: this.identifier,
    });
  }

  getData() {
    this.isLoading = true;

    if (this._route.snapshot.data['data']) {
      this.data = this._route.snapshot.data['data'].result.dataList;
      this.pagination.totalElements =
        this._route.snapshot.data['data'].result.totalCount;
      this.isLoading = false;
    } else {
      this.refreshData();
    }
  }

  refreshData() {
    this.isLoading = true;
    // this._unsubscribeService.destroy();

    const endpoint =
      this.activeTab === 'favorites'
        ? 'DashboardV2/GetImportentMatterList'
        : this.routeData['endpoint']?.get;

    of(null)
      .pipe(
        this._unsubscribeService.takeUntilDestroy(),
        switchMap(() =>
          this._apiService.get(endpoint, {
            ...this.pagination,
            [this.routeData['idKey']]: this.identifier,
          }),
        ),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this.data = res.result?.dataList || [];
            const total = Number(res.result?.totalCount ?? this.data.length);
            this.pagination = { ...this.pagination, totalElements: total };
            console.log('TotalCount:', res.result?.totalCount);
            console.log('Data length:', this.data.length);

            this.first =
              (this.pagination.pageNum - 1) * this.pagination.pagSize;
          }
        },
      });
  }

  // onPageChange(e: any) {
  //   this.pagination = {
  //     ...this.pagination,
  //     pagSize: Number(e.rows),
  //     pageNum: e.first / e.rows + 1,
  //     matterId: this.identifier
  //   };

  //   this.first = e.first;
  //   this.refreshData();
  // }
  onPageChange(e: any) {
    console.log('Before', this.pagination);

    this.pagination = {
      ...this.pagination,
      pagSize: Number(e.rows),
      pageNum: e.first / e.rows + 1,
      matterId: this.identifier,
    };

    console.log('After', this.pagination);

    this.refreshData();
  }
  filterBySearch(data: any[], searchValue: string) {
    const searchWords = searchValue.trim().toLowerCase().split(/\s+/);
    return data.filter((item) =>
      searchWords.every((word) =>
        JSON.stringify(item).toLowerCase().includes(word),
      ),
    );
  }

  filterUndefinedValues(obj: any) {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([key, v]) =>
          (v !== undefined && v !== null) ||
          ['pageNum', 'pagSize', 'orderBy', 'orderByDirection'].includes(key),
      ),
    );
  }

  onSort(e: any) {
    const field = e.field;
    if (!field) return;

    if (this.pagination.orderBy !== field) {
      this.pagination.orderBy = field;
      this.pagination.orderByDirection = 'DESC';
    } else {
      this.pagination.orderByDirection =
        this.pagination.orderByDirection === 'DESC' ? 'ASC' : 'DESC';
    }

    console.log(
      'Sorting:',
      this.pagination.orderBy,
      this.pagination.orderByDirection,
    );

    this.pagination.pageNum = 1;
    this.first = 0;
    this.refreshData();
  }
  toggleFavourite(rowData: MatterDto) {
    const payload = { matterId: rowData.id };
    this._apiService
      .post(API_Config.matters.importentMatter, null, payload)
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) rowData.isImportent = !rowData.isImportent;
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
