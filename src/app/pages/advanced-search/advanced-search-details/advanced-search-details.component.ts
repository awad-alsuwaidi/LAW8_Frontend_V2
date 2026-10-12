import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  ParamMap,
  Params,
  Router,
  RouterModule,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { AdvancedSearch } from './advanced-search.config';
import { GlobalSearch } from '../enum/global-search.enum';

@Component({
  selector: 'app-advanced-search-details',
  standalone: true,
  imports: [SharedTableComponent, TranslateModule, RouterModule],
  templateUrl: './advanced-search-details.component.html',
  styleUrl: './advanced-search-details.component.scss',
})
export class AdvancedSearchDetailsComponent implements OnInit, OnDestroy {
  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  protected moduleName!: string;
  protected searchValue!: string;
  protected advancedSearch = AdvancedSearch;
  private GlobalSearch: any = GlobalSearch;
  pagination: any = { pagSize: PAGESIZE, pageNum: 1, orderByDirection: 'ASC' };
  first!: number;
  data: any[] = [];
  protected isLoading: boolean = false;
  columns: any;
  ngOnInit(): void {
    this._route.params.subscribe((params: Params) => {
      this.moduleName = params['module'];
      this.searchValue = params['search'];
      this.columns = this.advancedSearch[this.moduleName].columns;
      this.getData();
    });
  }
  getData() {
    if (!this.moduleName && !this.searchValue) return;
    this.pagination = {
      ...this.pagination,
      module: this.moduleName,
      search: this.searchValue,
    };
    this._apiService
      .get(API_Config.search.get, this.pagination)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.data = res.result['dataList'] || [];
          this.pagination.totalElements = res.result['totalCount'] || 0;
          this.pagination = { ...this.pagination };
        },
      });
  }
  onPageChange(e: any) {
    this.pagination.pagSize = Number(e.rows);
    this.pagination.pageNum = e.first / e.rows + 1;
    this.first = e?.first;
    this.getData();
  }
  navigate(rowData: any) {
    const firstSegmant =
      this.advancedSearch[this.moduleName].routeParts.firstSegment;
    const lastSegmant =
      this.advancedSearch[this.moduleName].routeParts.lastSegment;
    const idKey = this.advancedSearch[this.moduleName].idkey;
    console.log(`${firstSegmant}${rowData[idKey]}${lastSegmant}`);
    const url = this._router.serializeUrl(
      this._router.createUrlTree([
        `${firstSegmant}${rowData[idKey]}${lastSegmant}`,
      ])
    );
    window.open('#' + url, '_blank');
  }
  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
