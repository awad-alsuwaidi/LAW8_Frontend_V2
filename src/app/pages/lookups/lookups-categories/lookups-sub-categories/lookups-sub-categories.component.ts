import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Lookups_API } from 'src/app/@core/api/api-config/lookups';
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
import { LookupsCategoryEditorComponent } from '../components/lookups-category-editor/lookups-category-editor.component';
import { LookupCategoryDto } from '../interfaces/lookup-category.interface';
import { LookupSubCategoryDto } from '../interfaces/lookup-sub-category.interface';
import { LookupsCategoriesService } from '../services/lookups-categories.service';
import { LookupsSubCategoryEditorComponent } from './components/lookups-sub-category-editor/lookups-sub-category-editor.component';
import { Lookup_Sub_Categories_Columns } from './lookups-sub-categories-columns.config';
import { lookupSubCategory_statusConfig } from './lookups-sub-categories-status.config';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { map } from 'rxjs';

@Component({
  selector: 'app-lookups-sub-categories',
  standalone: true,
  imports: [SharedButtonComponent, SharedModule, SharedTableComponent],
  templateUrl: './lookups-sub-categories.component.html',
  styleUrl: './lookups-sub-categories.component.scss',
})

export class LookupsSubCategoriesComponent implements OnInit, OnDestroy {
  private _lookupsCategoriesService = inject(LookupsCategoriesService);
  protected _router = inject(Router);
  protected _route = inject(ActivatedRoute);
  protected _languageService = inject(LanguageService);
  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _dialogService = inject(DialogService);
  private _toastrNotifiService = inject(ToastrNotifiService);

  category?: LookupCategoryDto;
  categoryIdentifier!: number;

  data: LookupSubCategoryDto[] = [];
  columns = Lookup_Sub_Categories_Columns;
  statusConfig = lookupSubCategory_statusConfig;

  isLoading = false;
  hasLoaded = false;

  pagination: any = {
    pageNumber: 1,
    pageSize: PAGESIZE ?? 10,
    totalElements: 0,
  };

  sortBy = 'id';
  isDescending = false;

  sortField = 'id';
  sortOrder = 1;

  private getDataTimeout: any;
  private deleteDialogRef!: DynamicDialogRef;

  ngOnInit(): void {
    console.log('SubCategories init');
    const fromService =
      this._lookupsCategoriesService.getLookupCategoryDetails();
    if (fromService) {
      this.category = fromService;
    }
    this._route.paramMap
      .pipe(
        map((params) => params.get('id')),
        distinctUntilChanged(),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe((idParam) => {
        if (!idParam) {
          this._router.navigate(['../'], { relativeTo: this._route });
          return;
        }
        const newId = Number(idParam);
        if (this.categoryIdentifier === newId && this.hasLoaded) {
          return;
        }
        this.categoryIdentifier = newId;
        const cat = this._lookupsCategoriesService.getLookupCategoryDetails();
        if (cat && cat.id === newId) {
          this.category = cat;
          console.log('Using cached category from service');
        } else if (!this.category || this.category.id !== newId) {
          this.loadCategory(newId);
        }
        this.getData();
      });
  }

  ngOnDestroy(): void {
    clearTimeout(this.getDataTimeout);
    this._unsubscribe.destroy();
  }

  private loadCategory(id: number): void {
    const url = `${Lookups_API.matterCategories.getById}/${id}`;
    this._apiService
      .get<any>(url)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const body = res?.data ?? res?.result ?? res;
          if (body) {
            this.category = {
              id: body.id,
              nameEn: body.nameEn,
              nameAr: body.nameAr,
              isActive: body.isActive,
              active: body.isActive,
              practiceAreaId: body.practiceAreaId,
              practiceAreaName: body.practiceAreaName,
              hasClasses: body.hasClasses,
              practsArea: body.practiceAreaName,
              practsAreaId: body.practiceAreaId,
            } as any;
          }
        },
        error: (err) => {
          console.error('loadCategory failed:', err);
        },
      });
  }

  getData(): void {
    clearTimeout(this.getDataTimeout);
    this.getDataTimeout = setTimeout(() => {
      if (!this.categoryIdentifier) {
        console.warn('categoryIdentifier not set — abort');
        return;
      }

      this.isLoading = true;
      const params = {
        pageNumber: this.pagination.pageNumber,
        pageSize: this.pagination.pageSize,
        sortBy: this.sortBy,
        isDescending: this.isDescending,
      };

      const url = `${Lookups_API.matterTypes.getByCategory}/${this.categoryIdentifier}`;
      console.log('📡 Fetching subcategories:', url, params);

      this._apiService
        .get<any>(url, params)
        .pipe(this._unsubscribe.takeUntilDestroy())
        .subscribe({
          next: (res: any) => {
            const body = res?.data ?? res?.result ?? res;
            const list = body?.items ?? body?.dataList ?? [];

            this.data = list.map((obj: any) => ({
              id: obj.id,
              matterCategoryId: obj.matterCategoryId,
              nameEn: obj.nameEn,
              nameAr: obj.nameAr,
              appealPeriod: obj.appealPeriod,
              cassationPeriod: obj.cassationPeriod,
              isActive: obj.isActive,
              active: obj.isActive,
              activeText: this._languageService.getTransValue(
                obj.isActive ? 'common.active' : 'common.inactive',
              ),
            }));

            this.pagination.totalElements = body?.totalCount ?? 0;
            this.pagination = { ...this.pagination };
            this.isLoading = false;
            this.hasLoaded = true;
          },
          error: (err) => {
            console.error('Subcategories fetch failed:', err);
            this.data = [];
            this.pagination.totalElements = 0;
            this.isLoading = false;
            this.hasLoaded = true;
          },
        });
    }, 200);
  }

  openCategoryEditor(): void {
    const ref = this._dialogService.open(LookupsCategoryEditorComponent, {
      header: this._languageService.getTransValue('lookups.editCategory'),
      width: '40vw',
      data: { rowData: this.category },
    });
    ref.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
      next: (res) => {
        if (res) {
          this._lookupsCategoriesService.updateLookupCategoryDetails(res);
          this.loadCategory(this.categoryIdentifier);
        }
      },
    });
  }

  openSubCategoryEditor(rowData?: LookupSubCategoryDto): void {
    const ref = this._dialogService.open(LookupsSubCategoryEditorComponent, {
      header: this._languageService.getTransValue(
        rowData ? 'lookups.editSubCategory' : 'lookups.addSubCategory',
      ),
      width: '40vw',
      data: {
        rowData,
        categoryId: this.categoryIdentifier,
      },
    });
    ref.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
      next: (res) => {
        if (res) this.getData();
      },
    });
  }

  onSort(event: any): void {
    this.sortBy = event.field;
    this.isDescending = event.order === -1;
    this.pagination.pageNumber = 1;
    this.pagination = { ...this.pagination };
    this.getData();
  }

  onPageChange(event: any): void {
    this.pagination.pageSize = Number(event.rows);
    this.pagination.pageNumber = Math.floor(event.first / event.rows) + 1;
    this.pagination = { ...this.pagination };
    this.getData();
  }

  onDelete(rowData: LookupSubCategoryDto): void {
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

  deleteRow(rowDataId: number): void {
    const url = `${Lookups_API.matterTypes.delete}/${rowDataId}`;
    this._apiService
      .delete<ApiRes>(url)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const ok = res?.isSuccess === true || res?.success === true;
          if (ok) {
            if (this.data.length === 1) this.pagination.pageNumber--;
            this.getData();
            this._toastrNotifiService.displaySuccess(res?.message ?? 'Deleted');
            this.deleteDialogRef.close();
          }
        },
        error: (err) => {
          this._toastrNotifiService.displayError(
            err?.error?.message ?? 'Failed to delete',
          );
        },
      });
  }
}
