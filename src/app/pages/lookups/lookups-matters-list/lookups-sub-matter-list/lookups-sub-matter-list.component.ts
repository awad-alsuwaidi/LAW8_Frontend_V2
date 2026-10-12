import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';

import { LookupsSubMatterListEditorComponent } from './components/lookups-sub-matter-list-editor/lookups-sub-matter-list-editor.component';
import { API_CONFIG } from './lookup-sub-matter-list-api.config';
import { Lookup_Sub_Matter_list_Columns } from './lookups-sub-matter-list-columns.config';
import { lookupSubMatterList_statusConfig } from './lookups-sub-matter-list-status.config';

@Component({
  selector: 'app-lookups-sub-matter-list',
  standalone: true,
  imports: [SharedButtonComponent, SharedModule, SharedTableComponent],
  templateUrl: './lookups-sub-matter-list.component.html',
  styleUrl: './lookups-sub-matter-list.component.scss',
})
export class LookupsSubMatterListComponent implements OnInit, OnDestroy {
  // ==================== DI ====================
  protected _router = inject(Router);
  protected _route = inject(ActivatedRoute);
  protected _languageService = inject(LanguageService);
  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _dialogService = inject(DialogService);
  private _toastrNotifiService = inject(ToastrNotifiService);

  // ==================== State ====================
  data: any[] = [];
  lastSortField = '';
  lastSortDir = '';
  statusConfig = lookupSubMatterList_statusConfig;
  apiConfig = API_CONFIG;
  apiConfigSelected: any;
  columns: any[] = [];
  groupId!: number;
  canDelete = true;
  isLoading = false;


  private deleteDialogRef!: DynamicDialogRef;
 

  /** ★ يتتبع آخر group تم تحميله لمنع إعادة التحميل */
  private _currentGroupId?: number;

  pagination: any = {
    pageSize: PAGESIZE ?? 10,
    pageNumber: 1,
    orderBy: 'nameEn',
    orderByDirection: 'ASC',
    totalElements: 0,
  };


  // ============================================================
  // ★ Input — يشتغل لما يتستخدم جوه template (billing-tabs)
  // ============================================================
  @Input() set subMatterListId(value: string | number) {
    const id = Number(value);
    if (!id) return;
    if (this._currentGroupId === id) return;  // ★ منع double load
    this.loadGroup(id);
  }
  // ==================== Lifecycle ====================
ngOnInit(): void {
    // ★ يشتغل لما يتستخدم عن طريق الـ Route (path: ':subMatterListId')
    this._route.paramMap
      .pipe(
        map((params) => params.get('subMatterListId')),
        distinctUntilChanged(),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe((idParam) => {
        if (!idParam) return;

        const id = Number(idParam);
        if (this._currentGroupId === id) return;  // ★ منع double load
        this.loadGroup(id);
      });
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }

  // ============================================================
  // ★ Load Group — نقطة واحدة للتحميل
  // ============================================================
  private loadGroup(id: number): void {
    this._currentGroupId = id;
    this.groupId = id;
    this.apiConfigSelected = this.apiConfig[id];

    if (!this.apiConfigSelected) {
      console.warn('⚠️ No config for groupId:', id);
      this.data = [];
      return;
    }

    this.canDelete = true;
    this.columns = Lookup_Sub_Matter_list_Columns(this.groupId);
    this.pagination.pageNumber = 1;

    console.log('🚀 Loading sub-matter-list for groupId:', id);
    this.getData();
  }

  // ============================================================
  // ★ Get Data — محدّث للـ endpoints الجديدة
  // ============================================================
getData(): void {
  if (!this.apiConfigSelected?.api?.get) {
    console.warn('⚠️ No API endpoint for groupId:', this.groupId);
    this.data = [];
    return;
  }

  this.isLoading = true;
  const url = this.apiConfigSelected.api.get;
  console.log('📡 Fetching:', url, this.pagination);

  this._apiService
    .get<any>(url, this.pagination)
    .pipe(
      this._unsubscribe.takeUntilDestroy(),
      finalize(() => (this.isLoading = false))
    )
    .subscribe({
      next: (res: any) => {
        console.log('✅ Response:', res);

        // unwrap يدعم الشكلين
        const body = res?.data ?? res?.result ?? res;
        const list = body?.items ?? body?.dataList ?? [];

        this.data = list.map((obj: any) => {
          // ★★★ الإصلاح: استخدم isActive كأساس، و active كـ fallback
          const isActiveValue = obj.isActive ?? obj.active ?? false;

          return {
            ...obj,
            // ★ وحّد الحقلين للـ template
            active: isActiveValue,
            isActive: isActiveValue,
            groupName: obj.groupName || '',
            activeText: this._languageService.getTransValue(
              isActiveValue ? 'common.active' : 'common.inactive'
            ),
            defaultText:
              this.groupId === 13
                ? this._languageService.getTransValue(
                    obj.isDefault ? 'common.default' : 'common.notDefault'
                  )
                : null,
          };
        });

        this.pagination.totalElements =
          body?.totalCount ?? body?.totalElements ?? 0;
        this.pagination = { ...this.pagination };

        console.log('📊 Mapped data (first item):', this.data[0]);
      },
      error: (err) => {
        console.error('❌ Fetch failed:', err);
        this.data = [];
        this.pagination.totalElements = 0;
      },
    });
}

  // ==================== Sorting / Pagination ====================
  onSort(event: any): void {
    const field = event.field;
    const dir = event.order === 1 ? 'ASC' : 'DESC';

    if (this.lastSortField === field && this.lastSortDir === dir) return;

    this.lastSortField = field;
    this.lastSortDir = dir;
    this.pagination.orderBy = field;
    this.pagination.orderByDirection = dir;
    this.pagination.pageNumber = 1;
    this.getData();
  }

  onPageChange(event: any): void {
    this.pagination.pagSize = Number(event.rows);
    this.pagination.pageNumber = Math.floor(event.first / event.rows) + 1;
    this.pagination = { ...this.pagination };
    this.getData();
  }

  // ==================== Row Guards ====================
  isRowLocked(row: any): boolean {
    if (this.apiConfigSelected?.values?.includes(row.id)) return true;
    if (this.groupId === 7 && row.groupName === 'افتراضي') return true;
    if (this.groupId === 13 && Number(row.id) === 7) return true;
    return false;
  }

  canShowRowActions(rowData: any): boolean {
    if (this.apiConfigSelected?.values?.includes(rowData.id)) return false;
    if (this.groupId === 7 && rowData.groupName === 'افتراضي') return false;
    return true;
  }

  isEditDisabled(row: any): boolean {
    if (this.groupId !== 8) return false;
    return [1, 2, 3, 4].includes(Number(row.id));
  }

  // ==================== Editor Dialog ====================
  openSubMatterListEditor(rowData?: any): void {
    const ref = this._dialogService.open(LookupsSubMatterListEditorComponent, {
      header: this._languageService.getTransValue(
        rowData ? 'lookups.editSubCategory' : 'lookups.addSubCategory'
      ),
      width: '40vw',
      data: {
        rowData,
        apiConfig: this.apiConfigSelected.api,
        groupId: this.groupId,
      },
    });

    ref.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
      next: (res) => {
        if (res) this.getData();
      },
    });
  }

  // ==================== Delete ====================
  onDelete(rowData: any): void {
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
          message: this._languageService.getTransValue('messages.deleteMessage'),
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
      }
    );
  }

deleteRow(rowDataId: number): void {
  const base = this.apiConfigSelected.api.delete;
  const url = `${base}/${rowDataId}`;

  console.log('🗑️ DELETE', url);

  this._apiService
    .delete<ApiRes>(url)   // ★ لازم ApiService.delete بيعمل HTTP DELETE
    .pipe(
      this._unsubscribe.takeUntilDestroy(),
      finalize(() => this.deleteDialogRef?.close())
    )
    .subscribe({
      next: (res: any) => {
        const ok = res?.isSuccess === true || res?.success === true;
        if (ok) {
          if (this.data.length === 1) this.pagination.pageNum--;
          this.getData();
          this._toastrNotifiService.displaySuccess(res?.message ?? 'Deleted');
        } else {
          this._toastrNotifiService.displayError(
            res?.message ?? 'Failed to delete'
          );
        }
      },
      error: (err) => {
        console.error('❌ Delete failed:', err);
        this._toastrNotifiService.displayError(
          err?.error?.message ?? 'Something went wrong'
        );
      },
    });
}
}