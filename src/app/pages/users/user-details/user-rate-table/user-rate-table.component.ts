import {
  Component,
  effect,
  inject,
  input,
  InputSignal,
  OnDestroy,
  OnInit,
} from '@angular/core';
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
export class UserRateTableComponent implements OnDestroy {
  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _userDetailsService = inject(UserDetailsService);
  private _route = inject(ActivatedRoute);
  private _dialogService = inject(DialogService);

  data: DefaultRateDto[] = [];
  columns = User_Default_Rate_Columns;
  pagination: any = {
    pagSize: PAGESIZE,
    pageNum: 1,
    orderByDirection: 'ASC',
  };
  userIdentifier!: string;
  signalEffect = effect(() => {
    if (Object.keys(this._userDetailsService.getUserData()).length > 0) {
      this.getData();
    } else {
      this.getParams();
    }
  });
  getParams() {
    this._route.params.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
      next: (params: Params) => {
        this.userIdentifier = params['userIdentifier'];
        this.getData();
      },
    });
  }

  getData() {
    const userId =
      this._userDetailsService.getUserData()?.id ?? this.userIdentifier;

    if (!userId) {
      console.warn('No userId — abort getData');
      return;
    }
    const url = `${API_Config.usersRate.get}/${userId}/rates`;

    const params = {
      pagSize: this.pagination.pagSize,
      pageNum: this.pagination.pageNum,
      orderByDirection: this.pagination.orderByDirection,
    };

    this._apiService
      .get(url, params)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const body = res?.data ?? res?.result ?? {};
          const items: any[] = body?.items ?? body?.dataList ?? [];
          this.data = items.map((obj: any) => ({
            id: obj.id,
            rate: obj.rate ?? obj.rateName ?? '',
            name: obj.name ?? obj.rateName ?? '',
            amount: obj.amount ?? 0,
            active: obj.active ?? obj.isActive ?? true,
          })) as any;

          this.pagination.totalElements = body?.totalCount ?? 0;
          this.pagination = { ...this.pagination };

          console.log('📊 rates loaded:', this.data);
        },
        error: (err) => console.error('rates fetch failed:', err),
      });
  }

  openRateTableEditor(rowData: DefaultRateDto) {
    const ref = this._dialogService.open(UserRateTableEditorComponent, {
      header: 'Update Rate',
      width: '40vw',
      data: { rowData },
    });
    ref.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
      next: (res) => {
        if (res) this.getData();
      },
    });
  }
  onPageChange(event: any) {
    this.pagination.pagSize = Number(event.rows);
    this.pagination.pageNum = event.first / event.rows + 1;
    this.pagination = { ...this.pagination };
    this.getData();
  }
  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
