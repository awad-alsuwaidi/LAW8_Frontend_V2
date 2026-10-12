import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router'; // ✅ Router عشان نعمل navigation
import { SharedModule } from 'src/app/@shared/shared.module';
import { PaginatorModule } from 'primeng/paginator';
import { SharedSearchComponent } from 'src/app/@shared/components/shared-search/shared-search.component';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { UserDto } from './interfaces/user.interface';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [RouterOutlet, SharedSearchComponent, PaginatorModule, SharedModule],
  templateUrl: './client-portal.component.html',
  styleUrl: './client-portal.component.scss',
})
export class ClientPortalComponent implements OnInit, OnDestroy {
  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _router = inject(Router);

  first: number = 0;
  isLoading!: boolean;
  data: UserDto[] = [];
  pagination: any = {
    pageNum: 1,
    pagSize: PAGESIZE,
    orderByDirection: 'ASC',
  };

  ngOnInit(): void {
    this.getData();
  }

  searchValueChange(value: string): void {
    this.pagination.search = value;
    this.pagination = { ...this.pagination };
    this.getData();
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.pagination.pagSize = Number(event.rows);
    this.pagination.pageNum = event.first / event.rows + 1;
    this.pagination = { ...this.pagination };
    this.getData();
  }

  getData() {
    this.isLoading = true;
    this._apiService
      .get(API_Config.users.get, this.pagination)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe((res: ApiRes) => {
        this.data = res?.result?.dataList || [];
        this.pagination.totalElements = res.result.totalCount;

        if (this.data.length > 0) {
          this._router.navigate(['/portal/view', this.data[0].id]);
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
