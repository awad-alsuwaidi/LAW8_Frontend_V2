import { Component, inject, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { Lookups_API } from 'src/app/@core/api/api-config/lookups'; 
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { TranslateModule } from '@ngx-translate/core';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { lookupsSubCategoryEditorConfig } from './lookup-sub-category-editor.config';

@Component({
  selector: 'app-lookups-sub-category-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    TranslateModule,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './lookups-sub-category-editor.component.html',
  styleUrl: './lookups-sub-category-editor.component.scss',
})
export class LookupsSubCategoryEditorComponent extends FormBaseClass implements OnInit {
  rowData?: any;
  categoryId?: number;

  ngOnInit(): void {
    this.categoryId = this._dynamicDialogConfig.data.categoryId;
    this.rowData = this._dynamicDialogConfig.data.rowData;
    this.initForm();
  }

  override initForm(): void {
    this.formlyFields = lookupsSubCategoryEditorConfig(this);
    if (this.rowData) {
      this.formlyModel = { ...this.rowData };
    }
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
    matterCategoryId: this.categoryId,
    appealPeriod: this.formlyModel.appealPeriod,
    cassationPeriod: this.formlyModel.cassationPeriod,
  };
  const url = isUpdate
    ? `${Lookups_API.matterTypes.update}/${this.rowData!.id}`
    : Lookups_API.matterTypes.create;

  const request$ = isUpdate
    ? this._apiService.put<ApiRes>(url, payload)   
    : this._apiService.post<ApiRes>(url, payload); 
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