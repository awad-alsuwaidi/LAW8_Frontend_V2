import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { PaginatorModule } from 'primeng/paginator';
import { distinctUntilChanged, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedSearchComponent } from 'src/app/@shared/components/shared-search/shared-search.component';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SearchCountDto } from './interfaces/search-count';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [RouterOutlet, SharedSearchComponent, SharedModule, PaginatorModule],
  templateUrl: './advanced-search.component.html',
  styleUrl: './advanced-search.component.scss',
})
export class AdvancedSearchComponent implements OnInit {
  protected _router = inject(Router);
  protected _route = inject(ActivatedRoute);
  private _unsubscribe = inject(UnsubscribeService);
  private _apiService = inject(ApiService);

  protected data: SearchCountDto[] = [];
  protected isPanelLoading = false;
  protected totalCount: number = 0;
  protected isLoading!: boolean;
  protected selectedIndex!: number;
  protected searchValue!: string;
  protected filterOptions: any;
  protected filterModuleData: any[] = [];
  isProduction = environment.production;

  ngOnInit(): void {
    // this._router.navigate(['/advanced-search']);
  }

  
searchValueChange(e: any) {
  this.searchValue = e?.trim();
  if (!this.searchValue) return;

  const formattedSearch = encodeURIComponent(this.searchValue);

  this.isLoading = true;

  const body = { search: formattedSearch };

  this._apiService
    .get(API_Config.search.globalSearch, body)
    .pipe(
      this._unsubscribe.takeUntilDestroy(),
      distinctUntilChanged(),
      finalize(() => (this.isLoading = false))
    )
    .subscribe({
      next: (res: ApiRes) => {
        if (res && res.isSuccess) {
          this.data = res.result;
          this._router.navigate(['/advanced-search']);
        } else {
          this.data = [];
        }
      },
      error: () => {
        this.data = [];
        this.isLoading = false;
      },
    });
}
  openItem(item: any) {
  this.isPanelLoading = true;
  this._router.navigate(['/advanced-search', item.module, this.searchValue]).then(() => {
    setTimeout(() => {
      this.isPanelLoading = false;
    }, 600); 
  });
}

}
