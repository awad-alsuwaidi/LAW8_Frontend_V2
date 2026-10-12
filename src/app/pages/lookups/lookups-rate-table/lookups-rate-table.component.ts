import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { PaginatorModule } from 'primeng/paginator';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService } from 'src/app/@core/services';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { EmptyConfig } from 'src/app/@shared/components/shared-empty-section/interface/empty-config.interface';
import { SharedEmptySectionComponent } from 'src/app/@shared/components/shared-empty-section/shared-empty-section.component';
import { SharedSearchComponent } from 'src/app/@shared/components/shared-search/shared-search.component';
import { SharedStatusComponent } from 'src/app/@shared/components/shared-status/shared-status.component';
import { ToggleFormService } from 'src/app/@shared/modules/formly-config/services/toggle-form.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { lookupCategory_statusConfig } from '../lookups-categories/lookups-categories-status.config';
import { RateTableDto } from './interfaces/rate-table.interface';
import { LookupsRateTableService } from './services/lookups-rate-table.service';
import { LookupsRateTableEditorComponent } from './components/lookups-rate-table-editor/lookups-rate-table-editor.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-lookups-rate-table',
  standalone: true,
  imports: [
    RouterModule,
    SharedModule,
    SharedButtonComponent,
    SharedEmptySectionComponent,
    SharedSearchComponent,
    PaginatorModule,
    SharedStatusComponent
  ],
  templateUrl: './lookups-rate-table.component.html',
  styleUrl: './lookups-rate-table.component.scss'
})
export class LookupsRateTableComponent implements OnInit, OnDestroy {
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _apiService = inject(ApiService);
  _toggleFormService = inject(ToggleFormService);
  _unsubscribeService = inject(UnsubscribeService);
  _dialogService = inject(DialogService)
  _languageService = inject(LanguageService)
  _lookupsRateTableService = inject(LookupsRateTableService)
  private searchTimer: any;
  selectedRowId: number | null = null;
  isLoading = true;
  data: RateTableDto[] = [];
  statusConfig = lookupCategory_statusConfig
  totalCount: number = 0;
  filterOptions: any = {
    pageNum: 1,
    pagSize: PAGESIZE,
    orderByDirection: 'ASC',
  };
  searchText: string = '';
  emptyConfig: EmptyConfig = {
    title: 'Rate Table',
    messageTitle: 'No Rate Table',
    description:this._languageService.getTransValue('lookups.youhavenoRateTableyetStartaddingRateTableonthetopcornerbutton'),
    addPermission: 'Add_RateType',
    addButton: {
      label: this._languageService.getTransValue('lookups.addRate'),
      command: () => {
        this.openRateEditor()
      }
    }
  }
   hasFetched: boolean = false;

// signalEffect = effect(() => {
//   if (!this.hasFetched && this._lookupsRateTableService.getLookupRateDetails()) {
//     this.getData();
//     this.hasFetched = true;
//   }
//     })
// 

ngOnInit(): void {
  this.getData(true);

  this._lookupsRateTableService.refreshRateTypeList$
    .pipe(this._unsubscribeService.takeUntilDestroy())
    .subscribe(() => {
      this.getData(false);
    });
}

refreshRateTypesAfterSubUpdate(): void {
  this.searchText = '';

  this.filterOptions = {
    ...this.filterOptions,
    pageNum: 1,
  };

  delete this.filterOptions.search;

  this.getData(false);
}


getData(openFirst = false) {
  this.isLoading = true;

  this._apiService
    .get(API_Config.rateTypes.get, this.filterOptions)
    .pipe(
      finalize(() => this.isLoading = false),
      this._unsubscribeService.takeUntilDestroy()
    )
    .subscribe((res: any) => {
      // ★ يقبل {data: {items}} أو {result: {dataList}}
      const result = res?.data ?? res?.result ?? {};
      const items: any[] = result?.items ?? result?.dataList ?? [];

      // ★ map isActive
      this.data = items.map((obj: any) => ({
        id: obj.id,
        nameEn: obj.nameEn ?? '',
        nameAr: obj.nameAr ?? '',
        isActive:
          typeof obj.isActive === 'boolean'
            ? obj.isActive
            : !!obj.active,
      }));

      this.totalCount = result?.totalCount ?? this.data.length;

      const routeId = Number(
        this._route.firstChild?.snapshot.paramMap.get('id') ||
        this._route.snapshot.paramMap.get('id')
      );

      const idToSelect =
        routeId ||
        this.selectedRowId ||
        (openFirst ? this.data[0]?.id : null);

      const selectedRow = this.data.find((x) => x.id === idToSelect);

      if (selectedRow) {
        this.selectedRowId = selectedRow.id;
        this._lookupsRateTableService.updateLookupRateDetails(selectedRow);

        if (openFirst && !routeId) {
          this._router.navigate(['/lookups/rate-table', selectedRow.id]);
        }
        return;
      }

      if (openFirst && this.data.length > 0) {
        this.openSubRate(this.data[0]);
      }
    });
}


openSubRate(rowData: RateTableDto) {
  this.selectedRowId = rowData.id;
  this._lookupsRateTableService.updateLookupRateDetails(rowData);

  if (this._router.url !== `/lookups/rate-table/${rowData.id}`) {
    this._router.navigate(['/lookups/rate-table', rowData.id]);
  }
}

openRateEditor() {
  const ref = this._dialogService.open(LookupsRateTableEditorComponent, {
    header: this._languageService.getTransValue('lookups.newRate'),
    width: '40vw'
  });

  ref.onClose.pipe(this._unsubscribeService.takeUntilDestroy()).subscribe({
    next: (res) => {
      if (res) {
        this.getData(false);
      }
    }
  });
}

searchValueChange(value: string): void {
  this.searchText = value;

  clearTimeout(this.searchTimer);

  this.searchTimer = setTimeout(() => {
    const search = value?.trim();

    this.filterOptions = {
      ...this.filterOptions,
      pageNum: 1,
      search: search || undefined
    };

    if (!search) {
      delete this.filterOptions.search;
    }

    this.getData(false);
  }, 400);
}

  onPageChange(event: any): void {
    this.filterOptions.pagSize = Number(event.rows);
    this.filterOptions.pageNum = event.first / event.rows + 1;
    this.filterOptions = { ...this.filterOptions }
    this.getData();
  }
  redirectToFirstClientInList() {
    this._router.navigate(['view/', this.data[0]?.id], { relativeTo: this._route })
  }
  ngOnDestroy(): void {
    this._unsubscribeService.destroy();
  }

}
