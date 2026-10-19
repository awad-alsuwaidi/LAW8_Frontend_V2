import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject, debounceTime, switchMap, of } from 'rxjs';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { DefaultRateDto } from '../../interfaces/default-rate.interface';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { User_Default_Rate_Columns } from './user-rate-table-columns.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { UserDetailsService } from '../services/user-details.service';
import { ActivatedRoute, Params } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { UserRateTableEditorComponent } from './user-rate-table-editor/user-rate-table-editor.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-rate-table',
  standalone: true,
  imports: [SharedTableComponent, TranslateModule],
  templateUrl: './user-rate-table.component.html',
  styleUrl: './user-rate-table.component.scss',
})
export class UserRateTableComponent implements OnInit, OnDestroy {
  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _userDetailsService = inject(UserDetailsService);
  private _route = inject(ActivatedRoute);
  private _dialogService = inject(DialogService);

  data: DefaultRateDto[] = [];
  columns = User_Default_Rate_Columns;

  pagination: any = {
    pageNumber: 1,
    pageSize: PAGESIZE,
    sortBy: '',
    isDescending: false,
  };

  userIdentifier!: string;

  private fetch$ = new Subject<void>();

  private lastFetchKey = '';

  signalEffect = effect(() => {
    const userData = this._userDetailsService.getUserData();
    const hasUserData = userData && Object.keys(userData).length > 0;
    const userId = this.userIdentifier ?? userData?.id;
    if (!userId) return;

    this.fetch$.next();
  });

  ngOnInit(): void {
    this.fetch$
      .pipe(
        debounceTime(0),                    
        switchMap(() => {
          const userId =
            this.userIdentifier ??
            this._userDetailsService.getUserData()?.id;

          if (!userId) return of(null);

          const params = {
            pageNumber: this.pagination.pageNumber,
            pageSize: this.pagination.pageSize,
            ...(this.pagination.sortBy && {
              sortBy: this.pagination.sortBy,
            }),
            isDescending: this.pagination.isDescending,
          };

          const key = `${userId}|${JSON.stringify(params)}`;
          if (key === this.lastFetchKey) return of(null);
          this.lastFetchKey = key;

          const url = `${API_Config.usersRate.get}/${userId}/rates`;
          return this._apiService.get(url, params);
        }),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          if (!res) return;

          const body = res?.data ?? res?.result ?? {};
          const items: any[] = body?.items ?? body?.dataList ?? [];

          this.data = items.map((obj: any) => ({
            id: obj.id,
            rate: obj.rateCode ?? '',
            name: obj.name ?? obj.rateName ?? '',
            amount: obj.amount ?? 0,
            active: obj.active ?? obj.isActive ?? true,
          })) as any;

          this.pagination.totalRecords = body?.totalCount ?? 0;
          this.pagination = { ...this.pagination };
        },
        error: (err) => console.error('rates fetch failed:', err),
      });

    this.getParams();
  }

  getParams() {
    this._route.params
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (params: Params) => {
          const newId = params['userIdentifier'];

          if (
            this.userIdentifier &&
            String(this.userIdentifier) !== String(newId)
          ) {
            this.data = [];
            this.pagination.pageNumber = 1;
            this.pagination = { ...this.pagination };
            this.lastFetchKey = '';
          }

          this.userIdentifier = newId;
          this.getData();
        },
      });
  }

  getData(): void {
    this.fetch$.next();
  }

  private forceRefresh(): void {
    this.lastFetchKey = '';
    this.fetch$.next();
  }

  handleSort(event: any) {
    if (!event?.field) return;

    this.pagination.sortBy = event.field;
    this.pagination.isDescending = event.order === -1;
    this.pagination.pageNumber = 1;
    this.getData();
  }

  onPageChange(event: any) {
    this.pagination.pageSize = Number(event.rows);
    this.pagination.pageNumber = event.first / event.rows + 1;
    this.pagination = { ...this.pagination };
    this.getData();
  }

  openRateTableEditor(rowData: DefaultRateDto) {
    const currentUserId =
      this.userIdentifier ??
      this._userDetailsService.getUserData()?.id;

    const ref = this._dialogService.open(UserRateTableEditorComponent, {
      header: 'Update Rate',
      width: '40vw',
      data: {
        rowData: rowData,
        userId: currentUserId,
      },
    });

    ref.onClose
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res) => {
          if (res) this.forceRefresh();
        },
      });
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}