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
import { Subject, debounceTime, switchMap } from 'rxjs'; // ★ جديد

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

  private refresh$ = new Subject<void>();

  data: any[] = [];
  isFirstLoad = true;
  searchValue = '';
  totalCount: number = 0;

  filterOptions: any = {
    pageNumber: 1,
    pageSize: PAGESIZE ?? 10,
    sortBy: 'id',
    isDescending: false,
    searchTerm: '',
  };

  searchText: string = '';
  isLoading!: boolean;
  first: number = 0;

  isSmallScreen = signal(false);
  titleKey = '';

  refreshData = effect(() => {
    if (this._clientService.getRefreshData()) {
      this.triggerRefresh();
    }
  });

  emptyConfig: EmptyConfig = {
    title: this._languageService.getTransValue('clients.clients'),
    messageTitle: this._languageService.getTransValue('clients.noClients'),
    description: this._languageService.getTransValue(
      'clients.emptyDescription',
    ),
    addPermission: 'Add_Client',
    addButton: {
      label: this._languageService.getTransValue('clients.addClient'),
      command: () => {
        this._router.navigate(['/clients/add']);
      },
    },
  };

  ngOnInit(): void {
    this.refresh$
      .pipe(
        debounceTime(50),
        switchMap(() => {
          const isInactive = this._router.url.includes('inactive');

          const params: any = {
            pageNumber: this.filterOptions.pageNumber,
            pageSize: this.filterOptions.pageSize,
            sortBy: this.filterOptions.sortBy,
            isDescending: this.filterOptions.isDescending,
          };

          if (this.filterOptions.searchTerm) {
            params.searchTerm = this.filterOptions.searchTerm;
          }
          params.isActive = !isInactive;

          return this._apiService.get(API_Config.client.get, params);
        }),
        this._unsubscribeService.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => this.handleResponse(res),
        error: (err) => {
          console.error('❌ fetch clients failed:', err);
          this.isLoading = false;
          this.isFirstLoad = false;
        },
      });

    if (this._router.url.includes('inactive')) {
      this.titleKey = this.isInhouse
        ? 'clients.inactiveEntities'
        : 'clients.inactiveClients';
    } else {
      this.titleKey = this.isInhouse ? 'clients.entities' : 'clients.clients';
    }

    this._breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this.isSmallScreen.set(result.matches);
      });

    this.getQueryParams();
  }

  private triggerRefresh(): void {
    this.isLoading = true;
    this.refresh$.next();
  }

  private handleResponse(res: any): void {
    const body = res?.data ?? res?.result ?? {};
    const items: any[] = body?.items ?? body?.dataList ?? [];

    this.data = items;

    this.totalCount = body?.totalCount ?? 0;
    this.isLoading = false;
    this.isFirstLoad = false;

    if (this.data.length > 0) {
      let selectedClient = this.data[0];

      if (this.searchValue) {
        const matched = this.data.find(
          (c: any) => c.clientCode === this.searchValue,
        );
        if (matched) selectedClient = matched;
      }

      const selectedId = selectedClient.id;
      const isInactive = this._router.url.includes('inactive');

      this._router.navigate(
        [isInactive ? '/clients/inactive/view' : '/clients/view', selectedId],
        { replaceUrl: true },
      );
    }
  }

  getData(): void {
    this.triggerRefresh();
  }

  getQueryParams() {
    this._route.queryParams.subscribe((params) => {
      if (['add', 'update'].some((word) => this._router.url.includes(word)))
        return;

      if (params['search']) {
        this.searchValue = params['search'];
        this.searchText = params['search'];
        this.filterOptions.searchTerm = params['search'];
      }

      setTimeout(() => {
        const input = document.querySelector(
          'app-shared-search input',
        ) as HTMLInputElement;
        if (input) input.value = this.searchValue;
      });

      this.triggerRefresh();
    });
  }

  searchValueChange(value: string): void {
    this.searchValue = value;
    this.searchText = value;
    this.filterOptions.searchTerm = value;
    this.filterOptions.pageNumber = 1;
    this.filterOptions = { ...this.filterOptions };
    this.triggerRefresh();
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.filterOptions.pageSize = Number(event.rows);
    this.filterOptions.pageNumber = event.first / event.rows + 1;
    this.filterOptions = { ...this.filterOptions };
    this.triggerRefresh();
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
