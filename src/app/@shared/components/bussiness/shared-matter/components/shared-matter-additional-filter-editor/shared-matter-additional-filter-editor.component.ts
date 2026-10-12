import { Component, OnInit } from '@angular/core';
import { FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { matterAdditionalFilterFields } from './matter-additional-filter-editor.config';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { combineLatest } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
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

  override getLookupsData(): void {
    combineLatest({
      clients: this._apiService.get(API_Config.general.getClients),
      practiceArea: this._apiService.get(
        API_Config.general.getPractsAreaLookup
      ),
      status: this._apiService.get(API_Config.general.getMatterStatus),
    })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res) => {
          this.lookupsData = res;
          const updateField = (key: string, data: any[]) => {
            const field = findField(this.formlyFields, key);
            if (field?.props) {
              field.props['optionsArr'] = data.map((obj: any) => ({
                label: obj.name,
                value: obj,
              }));
            }
          };

          updateField('clientId', this.lookupsData.clients.result);
          updateField('practiceAreaId', this.lookupsData.practiceArea.result);
          updateField('statusId', this.lookupsData.status.result);
        },
      });
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

  getMatterCategoryByPracticeAreaOptions(practiceArea: number) {
    const param = { PractsAreaId: practiceArea };
    this._apiService
      .get(API_Config.general.getMatterCategoriesLookup, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          const categoryField: FieldTypeConfig = findField(
            this.formlyFields,
            'categoryId'
          );
          if (categoryField) {
            categoryField.props['optionsArr'] = [];
            categoryField.formControl.reset();
            categoryField.props['optionsArr'] = (
              this.getApiResult(res) ?? []
            ).map((obj: any) => ({
              label: obj.name,
              value: obj,
            }));
          }
        },
      });
  }
  getApiResult(res: any) {
    return res.Result ?? res.result ?? {};
  }
  getMatterTypeByMatterCategoryOptions(matterCategory: number) {
    const param = { matClntId: matterCategory };
    this._apiService
      .get(API_Config.general.getMatterTypesByCategoryId, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          const matterTypeField: FieldTypeConfig = findField(
            this.formlyFields,
            'matterTypeId'
          );
          if (matterTypeField) {
            matterTypeField.props['optionsArr'] = [];
            matterTypeField.formControl.reset();
            matterTypeField.props['optionsArr'] = (
              this.getApiResult(res) ?? []
            ).map((obj: any) => ({
              label: obj.name,
              value: obj,
            }));
          }
        },
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
