import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { SharedEmptySectionComponent } from 'src/app/@shared/components/shared-empty-section/shared-empty-section.component';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedSearchComponent } from 'src/app/@shared/components/shared-search/shared-search.component';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { ApiService } from 'src/app/@core/api/api.service';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { ToggleFormService } from 'src/app/@shared/modules/formly-config/services/toggle-form.service';
import { ClientService } from './services/client.service';
import { EmptyConfig } from 'src/app/@shared/components/shared-empty-section/interface/empty-config.interface';
import { SharedModule } from 'src/app/@shared/shared.module';
import { finalize } from 'rxjs';
import { ClientSkeletonComponent } from './components/client-skeleton/client-skeleton.component';
import { LanguageService } from 'src/app/@core/services';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { HighlightPipe } from '../../@shared/pipes/highlight.pipe';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    SharedEmptySectionComponent,
    SharedButtonComponent,
    SharedSearchComponent,
    PaginatorModule,
    SharedModule,
    ClientSkeletonComponent,
    HighlightPipe,
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
})
export class ClientsComponent implements OnInit, OnDestroy {
  @ViewChild(SharedSearchComponent)
  searchComp!: SharedSearchComponent;
  isInhouse = environment.brand === 'inhouse';
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _apiService = inject(ApiService);
  _toggleFormService = inject(ToggleFormService);
  _clientService = inject(ClientService);
  _unsubscribeService = inject(UnsubscribeService);
  _languageService = inject(LanguageService);
  private _breakpointObserver = inject(BreakpointObserver);
  data: any[] = [];
  isFirstLoad = true;
  searchValue = '';
  totalCount: number = 0;
  filterOptions: any = {
    pageNum: 1,
    pagSize: PAGESIZE,
    orderByDirection: 'ASC',
  };
  searchText: string = '';
  isLoading!: boolean;
  first: number = 0;
  refreshData = effect(() => {
    if (this._clientService.getRefreshData()) {
      console.log('refreshData effect triggered');
      this.getData();
    }
  });
  emptyConfig: EmptyConfig = {
    title: this._languageService.getTransValue('clients.clients'),
    messageTitle: this._languageService.getTransValue('clients.noClients'),
    description: this._languageService.getTransValue(
      'clients.emptyDescription'
    ),
    addPermission: 'Add_Client',
    addButton: {
      label: this._languageService.getTransValue('clients.addClient'),
      command: () => {
        this._router.navigate(['/clients/add']);
      },
    },
  };

  isSmallScreen = signal(false);
  titleKey = '';

  ngOnInit(): void {
      if (this._router.url.includes('inactive')) {
    this.titleKey = this.isInhouse
      ? 'clients.inactiveEntities'
      : 'clients.inactiveClients';
  } else {
    this.titleKey = this.isInhouse
      ? 'clients.entities'
      : 'clients.clients';
  }
    this._breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isSmallScreen.set(result.matches);
      });
    this.getQueryParams();
  }


getData(): void {
  this.isLoading = true;

  const path = this._router.url.includes('inactive')
    ? API_Config.clientInActiveList.get
    : API_Config.client.get;

  this._apiService.get(path, this.filterOptions).pipe(
    finalize(() => {
      this.isLoading = false;
      this.isFirstLoad = false;  
    }),
    this._unsubscribeService.takeUntilDestroy()
  ).subscribe((res: ApiRes) => {

this.data = res?.result?.dataList ?? [];
this.totalCount = res?.result?.totalCount ?? 0;

if (this.data.length > 0) {

  let selectedClient = this.data[0];
  if (this.searchValue) {
    const matched = this.data.find(
      (c: any) => c.clntNo === this.searchValue
    );

    if (matched) {
      selectedClient = matched;
    }
  }

  const selectedId = selectedClient.id;

  if (this._router.url.includes('inactive')) {
    this._router.navigate(
      ['/clients/inactive/view', selectedId],
      { replaceUrl: true }
    );
  } else {
    this._router.navigate(
      ['/clients/view', selectedId],
      { replaceUrl: true }
    );
  }
}
  });
}

getQueryParams() {
  this._route.queryParams.subscribe((params) => {

    if (['add', 'update'].some((word) => this._router.url.includes(word)))
      return;

    if (params['search']) {
      this.searchValue = params['search'];
      this.searchText = params['search'];
      this.filterOptions.search = params['search'];
    }
setTimeout(() => {
  const input = document.querySelector('app-shared-search input') as HTMLInputElement;

  if (input) {
    input.value = this.searchValue;
  }
});
    this.getData();
  });
}
  // getQueryParams() {
  //   this._route.paramMap.subscribe((segments) => {
  //     console.log(
  //       'this._router.url',
  //       ['add', 'update'].some((word) => this._router.url.includes(word))
  //     );
  //     if (['add', 'update'].some((word) => this._router.url.includes(word)))
  //       return;
  //     this.getData();
  //   });
  // }
searchValueChange(value: string): void {
  this.searchValue = value;
  this.searchText = value;
  this.filterOptions.search = value;
  this.filterOptions = { ...this.filterOptions };
  this.getData();
}

  onPageChange(event: any): void {
    this.first = event.first;
    this.filterOptions.pagSize = Number(event.rows);
    this.filterOptions.pageNum = event.first / event.rows + 1;
    this.filterOptions = { ...this.filterOptions };
    console.log('this.filterOptions', this.filterOptions);
    this.getData();
  }

  redirectToFirstClientInList() {
    if (['add', 'update'].some((word) => this._router.url.includes(word)))
      return;

    if (!this._router.url.includes('view')) {
      this._router.navigate(['view', this.data[0]?.id], {
        relativeTo: this._route,
      });
    }
  }

  openClientDetails(clientId: number) {
    if (this.isSmallScreen()) {
      this._router.navigate(['clients/details', clientId]);
    } else {
      this._router.navigate(['view', clientId], { relativeTo: this._route });
    }
  }
  ngOnDestroy(): void {
    this._unsubscribeService.destroy();
  }
}
