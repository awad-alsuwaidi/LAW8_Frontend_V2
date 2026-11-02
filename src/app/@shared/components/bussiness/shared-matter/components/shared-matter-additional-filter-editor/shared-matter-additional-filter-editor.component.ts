import { Component, OnInit } from '@angular/core';
import { FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { matterAdditionalFilterFields } from './matter-additional-filter-editor.config';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-shared-matter-additional-filter-editor',
  standalone: true,
  imports: [
    CommonModule,
    ProgressSpinnerModule,
    FormlyConfigModule,
    SharedButtonComponent,
    TranslateModule,
  ],
  templateUrl: './shared-matter-additional-filter-editor.component.html',
  styleUrls: ['./shared-matter-additional-filter-editor.component.scss'],
})
export class SharedMatterAdditionalFilterEditorComponent
  extends FormBaseClass
  implements OnInit
{
  override isLoading = true;
  isInhouse = environment.brand === 'inhouse';

  ngOnInit(): void {
    this.formlyFields = matterAdditionalFilterFields(this);
    this.setForm();
    this.getLookupsData();
  }

  initForm() {
    this.formlyFields = matterAdditionalFilterFields(this);
    this.setForm();

    const practiceAreaId =
      this.formlyModel?.practiceAreaId?.id || this.formlyModel?.practiceAreaId;
    if (practiceAreaId) {
      this.getMatterCategoryByPracticeAreaOptions(practiceAreaId);
    }

    const categoryId =
      this.formlyModel?.categoryId?.id || this.formlyModel?.categoryId;
    if (categoryId) {
      this.getMatterTypeByMatterCategoryOptions(categoryId);
    }
  }

  setForm() {
    this.formlyModel = { ...this._dynamicDialogConfig.data.formlyModel };
  }

  // ---------------------------------------------------------
  // Lookups
  // ---------------------------------------------------------

  override getLookupsData(): void {
    const params: any = {
      'types[0]': 'practiceAreas',
      'types[1]': 'matterStatuses',
    };

    this._apiService
      .get(API_Config.general.getLookups, params)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const body = res?.result ?? res?.Result ?? res?.data ?? res ?? {};

          const pick = (key: string): any[] => {
            if (Array.isArray(body[key])) return body[key];
            if (Array.isArray(body?.items?.[key])) return body.items[key];
            if (Array.isArray(body)) {
              const entry = body.find(
                (x: any) =>
                  x?.type === key || x?.key === key || x?.lookupType === key,
              );
              return entry?.items ?? entry?.values ?? entry?.data ?? [];
            }
            return [];
          };

          const practiceAreas = pick('practiceAreas');
          const matterStatuses = pick('matterStatuses');

          this.updateFieldOptions('practiceAreaId', practiceAreas);
          this.updateFieldOptions('statusId', matterStatuses);

          // ✅ الـ clients من endpoint منفصل
          this.getClientsLookup();
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  private getClientsLookup(): void {
    this._apiService
      .get(API_Config.general.getClientsLookup, {
        pageNum: 1,
        pagSize: 1000, 
      })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const clients = this.extractLookupArray(res);
          this.updateFieldOptions('clientId', clients);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load clients', err);
          this.updateFieldOptions('clientId', []);
          this.isLoading = false;
        },
      });
  }

  private extractLookupArray(res: any): any[] {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.result)) return res.result;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.result?.items)) return res.result.items;
    if (Array.isArray(res?.result?.dataList)) return res.result.dataList;
    if (Array.isArray(res?.data?.items)) return res.data.items;
    if (Array.isArray(res?.data?.dataList)) return res.data.dataList;
    if (Array.isArray(res?.items)) return res.items;
    if (Array.isArray(res?.dataList)) return res.dataList;
    return [];
  }

  private updateFieldOptions(fieldKey: string, data: any[]): void {
    const field = findField(this.formlyFields, fieldKey);
    if (!field?.props) return;
    field.props['optionsArr'] = (data ?? []).map((obj: any) => ({
      label:
        obj.name ??
        obj.nameEn ??
        obj.nameAr ??
        obj.clientName ??
        obj.displayName,
      value: obj,
    }));
  }

  // ---------------------------------------------------------
  // Cascading (category → type)
  // ---------------------------------------------------------

  getApiResult(res: any) {
    const body = res?.data ?? res?.result ?? res?.Result ?? res ?? {};
    return body?.items ?? body?.dataList ?? (Array.isArray(body) ? body : []);
  }

  getMatterCategoryByPracticeAreaOptions(practiceArea: number) {
    const param = { practiceAreaId: practiceArea };
    this._apiService
      .get(API_Config.general.getMatterCategoriesLookup, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const categoryField: FieldTypeConfig = findField(
            this.formlyFields,
            'matterCategoryId',
          );
          if (!categoryField) return;

          categoryField.props['optionsArr'] = [];
          categoryField.formControl.reset();

          const items = this.getApiResult(res);
          categoryField.props['optionsArr'] = items.map((obj: any) => ({
            label: obj.name ?? obj.nameEn ?? obj.nameAr,
            value: obj,
          }));
        },
        error: (err) => console.error('Failed to load categories', err),
      });
  }

  getMatterTypeByMatterCategoryOptions(matterCategory: number) {
    const param = { matterCategoryId: matterCategory };
    this._apiService
      .get(API_Config.general.getMatterTypesByCategoryId, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const matterTypeField: FieldTypeConfig = findField(
            this.formlyFields,
            'matterTypeId',
          );
          if (!matterTypeField) return;

          matterTypeField.props['optionsArr'] = [];
          matterTypeField.formControl.reset();

          const items = this.getApiResult(res);
          matterTypeField.props['optionsArr'] = items.map((obj: any) => ({
            label: obj.name ?? obj.nameEn ?? obj.nameAr,
            value: obj,
          }));
        },
        error: (err) => console.error('Failed to load matter types', err),
      });
  }

  reset() {
    this.formlyModel = {};
    this.formly.reset();
  }

  onSubmit() {
    this._dynamicDialogRef.close(this.formly.value);
  }
}
