import {
  Component,
  effect,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { LookupSubjurisdictionDto } from '../interfaces/lookup-sup-jurisdictions';
import { Jurisdictions_Sub_Columns_EN } from './lookups-jurisdictions-columns.config';
import { LookupJurisdictionsDto } from '../interfaces/lookup-jurisdictions';
import { LookupsJurisdictionsService } from '../services/lookups-Jurisdictions.service';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { lookupSubCategory_statusConfig } from '../../lookups-categories/lookups-sub-categories/lookups-sub-categories-status.config';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { LookupsJurisdictionsEditorComponent } from '../components/lookups-jurisdictions-editor/lookups-jurisdictions-editor.component';
import { LookupsSubJurisdictionEditorComponent } from './components/lookups-sub-jurisdiction-editor/lookups-sub-jurisdiction-editor.component';
import { Subject, debounceTime, switchMap } from 'rxjs';

@Component({
  selector: 'app-lookups-sup-jurisdictions',
  standalone: true,
  imports: [
    TableModule,
    SharedButtonComponent,
    SharedModule,
    PaginatorModule,
    SharedTableComponent,
    MenuModule,
  ],
  templateUrl: './lookups-sup-jurisdictions.component.html',
  styleUrl: './lookups-sup-jurisdictions.component.scss',
})
export class LookupsSupJurisdictionsComponent implements OnInit, OnDestroy {
  private refresh$ = new Subject<void>();

  _lookupsJurisdictionService = inject(LookupsJurisdictionsService);
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _languageService = inject(LanguageService);
  _apiService = inject(ApiService);
  _unsubscribe = inject(UnsubscribeService);
  _dialogService = inject(DialogService);
  private _toastrNotifiService = inject(ToastrNotifiService);
  private deleteDialogRef!: DynamicDialogRef;

  jurisdiction?: LookupJurisdictionsDto;
  data: LookupSubjurisdictionDto[] = [];
  columns = Jurisdictions_Sub_Columns_EN;
  statusConfig = lookupSubCategory_statusConfig;

  pagination: any = {
    pagSize: PAGESIZE ?? 10,
    pageNum: 1,
    totalElements: 0,
    sortBy: 'id',
    isDescending: false,
  };

  isLoading: boolean = false;

  private jurisdictionIdentifier!: number;
  @Input() set jurisdictionId(value: number) {
    this.jurisdictionIdentifier = value;
  }

ngOnInit(): void {
  this.refresh$
    .pipe(
      debounceTime(50),
      switchMap(() => {
        const params = {
          jurisdictionId: this.jurisdiction?.id,      
          pagSize: this.pagination.pagSize,
          pageNum: this.pagination.pageNum,
          sortBy: this.pagination.sortBy,
          isDescending: this.pagination.isDescending,
          search: this.pagination.search,
        };
        return this._apiService.get(
          API_Config.judicatures.get,                 
          params,
        );
      }),
      this._unsubscribe.takeUntilDestroy(),
    )
    .subscribe({
      next: (res: any) => this.handleResponse(res),
      error: (err) => {
        console.error('fetch judicatures failed:', err);
        this.isLoading = false;
      },
    });
}

  private triggerRefresh(): void {
    if (!this.jurisdiction?.id) return;
    this.isLoading = true;
    this.refresh$.next();
  }

  private handleResponse(res: any): void {
    const result = res?.result ?? res?.data ?? {};
    const items: any[] = result?.items ?? result?.dataList ?? [];

    this.data = items.map((obj: any) => ({
      id: obj.id,
      jurisdictionId: obj.jurisdictionId ?? obj.law_JurisdictionId,
      nameEn: obj.nameEn,
      nameAr: obj.nameAr,
      isActive: obj.isActive ?? obj.active,
      activeText: this._languageService.getTransValue(
        (obj.isActive ?? obj.active) ? 'common.active' : 'common.inactive',
      ),
    }));

    this.pagination.totalElements = result?.totalCount ?? 0;
    this.pagination = { ...this.pagination };
    this.isLoading = false;
  }

  signalEffect = effect(() => {
    const current =
      this._lookupsJurisdictionService.getLookupJurisdictionDetails();
    if (current) {
      this.jurisdiction = current;
      this.triggerRefresh(); 
    } else {
      this._router.navigate(['../'], { relativeTo: this._route });
    }
  });

  openJurisdictionEditor() {
    const ref = this._dialogService.open(LookupsJurisdictionsEditorComponent, {
      header: this._languageService.getTransValue('lookups.editJurisdictions'),
      width: '40vw',
      data: { rowData: this.jurisdiction },
    });

    ref.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
      next: (updated: LookupJurisdictionsDto | undefined | boolean) => {
        if (!updated) return;
        if (typeof updated === 'object') {
          this._lookupsJurisdictionService.updatelookupJurisdictionDetails(
            updated as LookupJurisdictionsDto,
          );
        } else {
          this.refetchJurisdiction();
        }
      },
    });
  }

  private refetchJurisdiction() {
    if (!this.jurisdiction?.id) return;

    this._apiService
      .get(`${API_Config.jurisdictions.getById}/${this.jurisdiction.id}`)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          const data = res?.data ?? res?.result;
          if (data) {
            this._lookupsJurisdictionService.updatelookupJurisdictionDetails(
              data,
            );
          }
        },
      });
  }

  openSubJurisdictionEditor(rowData?: LookupSubjurisdictionDto) {
    const ref = this._dialogService.open(
      LookupsSubJurisdictionEditorComponent,
      {
        header: this._languageService.getTransValue(
          rowData
            ? 'lookups.editSubJurisdiction'
            : 'lookups.addSubJurisdiction',
        ),
        width: '40vw',
        data: { rowData, categoryId: this.jurisdictionIdentifier },
      },
    );

    ref.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
      next: (res) => {
        if (res) this.triggerRefresh(); 
      },
    });
  }

 
  onSort(event: any) {
    this.pagination.sortBy = event.sortBy ?? event.field;
    this.pagination.isDescending = event.isDescending ?? event.order === -1;
    this.pagination.pageNum = 1;
    this.pagination = { ...this.pagination };
    this.triggerRefresh(); 
  }

  onPageChange(event: any) {
    this.pagination.pagSize = Number(event.rows);
    this.pagination.pageNum = Math.floor(event.first / event.rows) + 1;
    this.pagination = { ...this.pagination };
    this.triggerRefresh(); 
  }


  onDelete(rowData: LookupSubjurisdictionDto) {
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
            'messages.deleteMessage',
          ),
          btns: [
            {
              label: this._languageService.getTransValue('lookups.discard'),
              styleClass: 'border border-grey500 text-grey500',
              command: () => this.deleteDialogRef.close(),
            },
            {
              label: this._languageService.getTransValue('lookups.delete'),
              styleClass: 'bg-textErrorBase text-white',
              command: () => this.deleteRow(rowData.id),
            },
          ],
        },
      },
    );
  }

  deleteRow(rowDataId: number) {
    this._apiService
      .delete(`${API_Config.judicatures.delete}/${rowDataId}`)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
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

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
