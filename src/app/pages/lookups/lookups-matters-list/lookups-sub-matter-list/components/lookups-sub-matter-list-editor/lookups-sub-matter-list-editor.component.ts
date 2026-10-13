import { Component, inject, OnInit } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { lookupsSubMatterListEditorConfig } from './lookups-sub-matter-list-editor.config';
import { finalize } from 'rxjs';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Lookups_API } from 'src/app/@core/api/api-config/lookups';

@Component({
  selector: 'app-lookups-sub-matter-list-editor',
  standalone: true,
  imports: [SharedButtonComponent, FormlyConfigModule, TranslateModule],
  templateUrl: './lookups-sub-matter-list-editor.component.html',
  styleUrl: './lookups-sub-matter-list-editor.component.scss',
})
export class LookupsSubMatterListEditorComponent
  extends FormBaseClass
  implements OnInit
{
  rowData: any;
  private router = inject(Router);
  showIsLitigation = false;
  groupId!: number;
  taskCodeGroups: any[] = [];

  ngOnInit(): void {
    this.groupId = Number(this._router.url.split('/').pop());
    this.showIsLitigation = this.groupId === 8;

    if (this.groupId === 7) {
      this.loadTaskCodeGroups();
    } else {
      this.initForm();
    }
  }

  override initForm(): void {
    this.rowData = this._dynamicDialogConfig.data.rowData;
    this.formlyFields = lookupsSubMatterListEditorConfig(this);

    if (this.rowData) {
      this.formlyModel = {
        ...this.rowData,
        active: this.rowData.isActive ?? this.rowData.active ?? true,
      };

      if (this.groupId === 7) {
        this.formlyModel.groupId = Number(
          this.rowData.taskCodeGroupId ?? this.rowData.groupId,
        );
        this.formlyModel.isBillable = this.rowData.isBillable ?? false;
      }

      if (this.groupId === 13 && this.rowData.nameEn) {
        this.formlyModel.nameEn = this.rowData.nameEn;
      }
    }

    console.log('📋 initForm → formlyModel:', this.formlyModel);
    console.log('📋 initForm → rowData:', this.rowData);
  }

  loadTaskCodeGroups(): void {
    const url = Lookups_API.taskCodesGroups.get;

    this._apiService
      .get<any>(url, {
        pageNumber: 1,
        pageSize: 1000,
        sortBy: 'id',
        isDescending: false,
      })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const body = res?.data ?? res?.result ?? res;
          const list = body?.items ?? body?.dataList ?? [];

          const isArabic = this._languageService.getSelectedLanguage() === 'ar';

          this.taskCodeGroups = list.map((item: any) => ({
            label: isArabic
              ? item.nameAr || item.nameEn
              : item.nameEn || item.nameAr,
            value: item.id,
            nameEn: item.nameEn,
            nameAr: item.nameAr,
          }));

          this.initForm();
          setTimeout(() => {
            const groupId =
              this.rowData?.taskCodeGroupId ?? this.rowData?.groupId;
            if (groupId != null) {
              const field = this.formly?.get('groupId');
              if (field) {
                field.setValue(Number(groupId));
              } else {
                console.warn('Field groupId not found in form');
              }
            }
          });
        },
        error: (err) => {
          this.taskCodeGroups = [];
          this.initForm();
        },
      });
  }

  override onSubmit(): void {
    if (this.formly.invalid) {
      this.formly.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const apiConfig = this._dynamicDialogConfig.data.apiConfig;
    const isUpdate = !!this.rowData;

    const payload = this.buildPayload();

    const url = isUpdate
      ? `${apiConfig.update}/${this.rowData.id}`
      : apiConfig.create;

    const request$ = isUpdate
      ? this._apiService.put<ApiRes>(url, payload)
      : this._apiService.post<ApiRes>(url, payload);

    console.log(`📤 ${isUpdate ? 'PUT' : 'POST'} ${url}`, payload);

    request$
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess) {
            this._toastrNotifiService.displaySuccess(res.message);
            this._dynamicDialogRef.close(true);
          }
        },
        error: (err) => {
          console.error('❌ Save failed:', err);
          this._toastrNotifiService.displayError(
            err?.error?.message || 'Failed to save',
          );
        },
      });
  }

  private buildPayload(): any {
    const model = this.formlyModel ?? {};
    const base: any = {
      nameEn: model.nameEn,
      nameAr: model.nameAr,
      isActive: model.active ?? model.isActive ?? true,
    };

    if (this.groupId === 7) {
      const groupId =
        typeof model.groupId === 'object'
          ? (model.groupId?.value ?? model.groupId?.id)
          : model.groupId;

      base.taskCodeGroupId = groupId;
      base.isBillable = model.isBillable ?? false;

      if (model.initial !== undefined) {
        base.initial = model.initial;
      }
    }

    if (this.groupId === 8) {
      base.isLitigation = model.isLitigation ?? false;
    }

    if (this.groupId === 13) {
      if (!base.nameEn && base.nameAr) {
        base.nameEn = base.nameAr;
      }
      base.description = model.description ?? null;
      base.isDefault = model.isDefault ?? false;
    }
    return base;
  }
}
