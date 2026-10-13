import {
  Component,
  effect,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { LookupsRateTableService } from '../services/lookups-rate-table.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { RateSubTableDto } from '../interfaces/rate-sub-table.interface';
import { LookupsRateTableEditorComponent } from '../components/lookups-rate-table-editor/lookups-rate-table-editor.component';
import { LookupsSubRateTableEditorComponent } from './components/lookups-sub-rate-table-editor/lookups-sub-rate-table-editor.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { lookupSubCategory_statusConfig } from '../../lookups-categories/lookups-sub-categories/lookups-sub-categories-status.config';
import { RateTableDto } from '../interfaces/rate-table.interface';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { Rate_Table_Sub_Columns_EN } from './lookups-sub-rate-table-columns.config';
import { Subject, debounceTime, switchMap } from 'rxjs';

@Component({
  selector: 'app-lookups-sub-rate-table',
  standalone: true,
  imports: [
    TableModule,
    SharedButtonComponent,
    SharedModule,
    PaginatorModule,
    SharedTableComponent,
    MenuModule,
  ],
  templateUrl: './lookups-sub-rate-table.component.html',
  styleUrl: './lookups-sub-rate-table.component.scss',
})
export class LookupsSubRateTableComponent implements OnInit, OnDestroy {
  // ============================================================
  // ★ Subject للـ debounce
  // ============================================================
  private refresh$ = new Subject<void>();

  _lookupsRateTableService = inject(LookupsRateTableService);
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _languageService = inject(LanguageService);
  _apiService = inject(ApiService);
  _unsubscribe = inject(UnsubscribeService);
  _dialogService = inject(DialogService);
  private _toastrNotifiService = inject(ToastrNotifiService);
  private deleteDialogRef!: DynamicDialogRef;

  rateTable?: RateTableDto;
  data: RateSubTableDto[] = [];
  columns = Rate_Table_Sub_Columns_EN;
  statusConfig = lookupSubCategory_statusConfig;

  pagination: any = {
    pageNum: 1,
    pagSize: PAGESIZE ?? 10,
    totalElements: 0,
    sortBy: 'id',
    isDescending: false,
  };

  private rateTableIdentifier!: number;
  @Input() set rateTableId(value: number) {
    this.rateTableIdentifier = value;
  }

  // ============================================================
  // ★ ngOnInit — debounce + switchMap
  // ============================================================
  ngOnInit(): void {
    this.refresh$
      .pipe(
        debounceTime(50),
        switchMap(() => {
          const params = {
            pagSize: this.pagination.pagSize,
            pageNum: this.pagination.pageNum,
            sortBy: this.pagination.sortBy,
            isDescending: this.pagination.isDescending,
            search: this.pagination.search,
          };
          return this._apiService.get(
            `${API_Config.rates.getByRateType}/${this.rateTable?.id}`,
            params
          );
        }),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: any) => this.handleResponse(res),
        error: (err) => console.error('❌ fetch rates failed:', err),
      });
  }

  // ============================================================
  // ★ triggerRefresh — بدل getData
  // ============================================================
  private triggerRefresh(): void {
    if (!this.rateTable?.id) return;
    this.refresh$.next();
  }

  // ============================================================
  // ★ handleResponse — map الـ data
  // ============================================================
  private handleResponse(res: any): void {
    const result = res?.data ?? res?.result ?? {};
    const items: any[] = result?.items ?? result?.dataList ?? [];

    this.data = items.map((obj: any) => {
      const isActive =
        typeof obj.isActive === 'boolean' ? obj.isActive : !!obj.active;
      return {
        id: obj.id,
        name: obj.name ?? '',
        code: obj.code ?? '',
        amount: obj.amount ?? 0,
        rateTypeId: obj.rateTypeId ?? this.rateTable?.id,
        isActive,
        activeText: this._languageService.getTransValue(
          isActive ? 'common.active' : 'common.inactive'
        ),
      };
    });

    this.pagination.totalElements = result?.totalCount ?? 0;
    this.pagination = { ...this.pagination };
  }

  // ============================================================
  // openRateEditor
  // ============================================================
  openRateEditor() {
    const ref = this._dialogService.open(LookupsRateTableEditorComponent, {
      header: this._languageService.getTransValue('lookups.editRate'),
      width: '40vw',
      data: { rowData: this.rateTable },
    });

    ref.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
      next: (res) => {
        if (res) {
          this.rateTable = res;
          this.rateTableIdentifier = res.id;
          this._lookupsRateTableService.updateLookupRateDetails(res);
          this._lookupsRateTableService.triggerRefreshRateTypeList();
        }
      },
    });
  }

  // ============================================================
  // openSubRateEditor
  // ============================================================
  openSubRateEditor(rowData?: RateSubTableDto) {
    const ref = this._dialogService.open(LookupsSubRateTableEditorComponent, {
      header: this._languageService.getTransValue(
        rowData ? 'lookups.editSubRate' : 'lookups.addSubRate'
      ),
      width: '40vw',
      data: { rowData, categoryId: this.rateTableIdentifier },
    });

    ref.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
      next: (res) => {
        if (res) {
          this.triggerRefresh();
          this._lookupsRateTableService.triggerRefreshRateTypeList();
        }
      },
    });
  }

  // ============================================================
  // signalEffect
  // ============================================================
  signalEffect = effect(() => {
    const rateDetails = this._lookupsRateTableService.getLookupRateDetails();
    if (!rateDetails) return;

    this.rateTable = rateDetails;
    this.rateTableIdentifier = rateDetails.id;
    this.triggerRefresh();
  });

  // ============================================================
  // onSort
  // ============================================================
  onSort(event: any): void {
    this.pagination.sortBy = event.sortBy ?? event.field;
    this.pagination.isDescending =
      event.isDescending ?? event.order === -1;
    this.pagination.pageNum = 1;
    this.pagination = { ...this.pagination };
    this.triggerRefresh();
  }

  // ============================================================
  // onPageChange
  // ============================================================
  onPageChange(event: any): void {
    this.pagination.pagSize = Number(event.rows);
    this.pagination.pageNum = Math.floor(event.first / event.rows) + 1;
    this.pagination = { ...this.pagination };
    this.triggerRefresh();
  }

  // ============================================================
  // deleteRow
  // ============================================================
  deleteRow(rowDataId: number) {
    this._apiService
      .delete(`${API_Config.rates.delete}/${rowDataId}`)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          if (res && (res.isSuccess || res.success)) {
            if (this.data.length === 1) this.pagination.pageNum--;
            this.triggerRefresh();
            this._toastrNotifiService.displaySuccess(res.message);
            this.deleteDialogRef.close();
          }
        },
        error: (err: any) =>
          this._toastrNotifiService.displayError(err?.error?.message),
      });
  }

  // ============================================================
  // onDelete — dialog
  // ============================================================
  onDelete(rowData: RateSubTableDto) {
    this.deleteDialogRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        modal: true,
        styleClass: 'w-[400px]',
        data: {
          type: ConfirmDialogType.Danger,
          title: this._languageService.getTransValue('messages.deleteTitle', {
            value: rowData?.id,
          }),
          message: this._languageService.getTransValue(
            'messages.deleteMessage'
          ),
          btns: [
            {
              label: this._languageService.getTransValue('lookups.discard'),
              styleClass: 'border border-grey500 text-grey500',
              command: () => {
                this.deleteDialogRef.close();
              },
            },
            {
              label: this._languageService.getTransValue('lookups.delete'),
              styleClass: 'bg-textErrorBase text-white',
              command: () => {
                this.deleteRow(rowData.id);
              },
            },
          ],
        },
      }
    );
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}