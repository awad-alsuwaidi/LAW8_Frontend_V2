import { Component, inject, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { Lookups_API } from 'src/app/@core/api/api-config/lookups'; 
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { TranslateModule } from '@ngx-translate/core';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { LookupCategoryDto } from '../../interfaces/lookup-category.interface';
import { LookupsCategoriesService } from '../../services/lookups-categories.service';
import { lookupsCategoryEditorConfig } from './lookups-category-editor-fields.config';

@Component({
  selector: 'app-lookups-category-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    TranslateModule,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './lookups-category-editor.component.html',
  styleUrl: './lookups-category-editor.component.scss',
})
export class LookupsCategoryEditorComponent extends FormBaseClass implements OnInit {
  rowData?: LookupCategoryDto;
  _lookupsCategoriesService = inject(LookupsCategoriesService);

  ngOnInit(): void {
    this.getLookupsData();
  }

  override getLookupsData(): void {
    this.isLoading = true;
    const url = Lookups_API.practiceAreas.lookup;
    this._apiService
      .get(url)
      .pipe(
        this._unsubscribe.takeUntilDestroy(),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (res: any) => {
          const body = res?.data ?? res?.result ?? res;
          const list = body?.items ?? body?.dataList ?? body ?? [];
          this.lookupsData = {
            result: list.map((p: any) => ({
              id: p.id,
              name: p.nameEn ?? p.name ?? '',
            })),
          };

          this.initForm();
        },
        error: (err) => {
          this.lookupsData = { result: [] };
          this.initForm();
        },
      });
  }

  override initForm(): void {
    this.formlyFields = lookupsCategoryEditorConfig(this);
    this.rowData = this._dynamicDialogConfig.data.rowData;
    if (this.rowData) this.formlyModel = { ...this.rowData };
  }

override onSubmit(): void {
  if (this.formly.invalid) {
    this.formly.markAllAsTouched();
    return;
  }

  const isUpdate = !!this.rowData;

  const payload = {
    nameEn: this.formlyModel.nameEn,
    nameAr: this.formlyModel.nameAr,
    isActive: this.formlyModel.active ?? true,
    practiceAreaId: this.formlyModel.practsAreaId ?? this.formlyModel.practiceAreaId,
  };

  const url = isUpdate
    ? `${Lookups_API.matterCategories.update}/${this.rowData!.id}`
    : Lookups_API.matterCategories.create;

  const request$ = isUpdate
    ? this._apiService.put<ApiRes>(url, payload)   
    : this._apiService.post<ApiRes>(url, payload); 

  console.log(`📤 ${isUpdate ? 'PUT' : 'POST'} ${url}`, payload);

  this.isSubmitted = true;
  request$
    .pipe(
      finalize(() => (this.isSubmitted = false)),
      this._unsubscribe.takeUntilDestroy()
    )
    .subscribe({
      next: (res: ApiRes) => {
        if (res?.isSuccess) {
          this._toastrNotifiService.displaySuccess(res.message);
          this._dynamicDialogRef.close(true);
          if (this.rowData) {
            this._lookupsCategoriesService.updateLookupCategoryDetails(res.result);
          }
        }
      },
      error: (err) => {
        this._toastrNotifiService.displayError(
          err?.error?.message || 'Failed to save'
        );
      },
    });
}
}