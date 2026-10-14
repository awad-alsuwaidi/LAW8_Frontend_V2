import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { EmptyConfig } from 'src/app/@shared/components/shared-empty-section/interface/empty-config.interface';
import { SharedEmptySectionComponent } from 'src/app/@shared/components/shared-empty-section/shared-empty-section.component';
import { SharedSearchComponent } from 'src/app/@shared/components/shared-search/shared-search.component';
import { SharedStatusComponent } from 'src/app/@shared/components/shared-status/shared-status.component';
import { ToggleFormService } from 'src/app/@shared/modules/formly-config/services/toggle-form.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { lookupCategory_statusConfig } from '../lookups-categories/lookups-categories-status.config';
import { LookupJurisdictionsDto } from './interfaces/lookup-jurisdictions';
import { LookupsJurisdictionsService } from './services/lookups-Jurisdictions.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { LookupsJurisdictionsEditorComponent } from './components/lookups-jurisdictions-editor/lookups-jurisdictions-editor.component';
import { LanguageService } from 'src/app/@core/services';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-lookups-jurisdictions',
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
  templateUrl: './lookups-jurisdictions.component.html',
  styleUrl: './lookups-jurisdictions.component.scss'
})
export class LookupsJurisdictionsComponent implements OnInit, OnDestroy {
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _apiService = inject(ApiService);
  _toggleFormService = inject(ToggleFormService);
  _unsubscribeService = inject(UnsubscribeService);
  _dialogService = inject(DialogService)
  _languageService = inject(LanguageService)
  _lookupsJurisdictionsService = inject(LookupsJurisdictionsService)
  isLoading: boolean = false;
  data: LookupJurisdictionsDto[] = [];
  statusConfig = lookupCategory_statusConfig
  totalCount: number = 0;
  filterOptions: any = {
    pageNum: 1,
    pagSize: PAGESIZE,
    orderByDirection: 'ASC',
  };
  searchText: string = '';
  emptyConfig: EmptyConfig = {
    title: 'Jurisdictions',
    messageTitle: 'No Jurisdictions',
    description: this._languageService.getTransValue('lookups.youhavenoJurisdictionsyetStartaddingJurisdictionsonthetopcornerbutton'),
    //'You have no Jurisdictions yet، Start adding Jurisdictions on the top corner button',
    addPermission: 'Add_Jurisdiction',
    addButton: {
      label: this._languageService.getTransValue('lookups.addJurisdiction'),
      command: () => {
        this.openJurisdictionEditor()
      }
    }
  }
  signalEffect = effect(() => {
      if (this._lookupsJurisdictionsService.getLookupJurisdictionDetails()) {
        this.getData()
      }
    })
 
  ngOnInit() {
    this.getData()
}

getData() {
  this.isLoading = true;

  this._apiService
    .get(API_Config.jurisdictions.get, this.filterOptions)
    .pipe(this._unsubscribeService.takeUntilDestroy())
    .subscribe({
      next: (res: any) => {
        const result = res?.data ?? res?.result ?? {};
        const items: any[] = result?.items ?? result?.dataList ?? [];

        this.data = items;

        this.totalCount =
          result?.totalCount ?? items.length;

        if (
          this.data.length &&
          !this._lookupsJurisdictionsService.getLookupJurisdictionDetails()
        ) {
          this.openSubJurisdiction(this.data[0]);
        }

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
}

  openJurisdictionEditor() {
    const ref = this._dialogService.open(LookupsJurisdictionsEditorComponent, {
      header: this._languageService.getTransValue('lookups.newJurisdictions'),
      width: '40vw'
    })
    ref.onClose.pipe(this._unsubscribeService.takeUntilDestroy()).subscribe({
      next: (res) => {
        if (res) {
          this.getData()
        }
      }
    })
  }
  openSubJurisdiction(rowData: LookupJurisdictionsDto) {
    this._lookupsJurisdictionsService.updatelookupJurisdictionDetails(rowData)
    this._router.navigate(['/lookups/jurisdictions/', rowData.id])

  }

  searchValueChange(value: string): void {
    this.searchText = value
    this.filterOptions.SearchTerm = value;
    this.filterOptions = { ...this.filterOptions }
    this.getData();
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
