import { Component, OnInit } from '@angular/core';
import { FieldTypeConfig } from '@ngx-formly/core';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { timsheeteAdditionalFilterFields } from './timesheet-additional-filter-editor.config';

@Component({
  selector: 'app-timesheet-additional-filter-editor',
  standalone: true,
  imports: [FormlyConfigModule, SharedButtonComponent, TranslateModule],
  templateUrl: './timesheet-additional-filter-editor.component.html',
  styleUrl: './timesheet-additional-filter-editor.component.scss',
})
export class TimesheetAdditionalFilterEditorComponent
  extends FormBaseClass
  implements OnInit
{
  override isLoading = true;

  ngOnInit(): void {
    this.getLookupsData();
  }

  override getLookupsData(): void {
    combineLatest({
      lawyers: this._apiService.get(
        API_Config.general.getUsersInitialViewForTimeShet,
      ),
      tasks: this._apiService.get(API_Config.general.getTaskCode),
      matterCode: this._apiService.get(API_Config.general.getMatterCodes),
    })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res) => {
          this.lookupsData = res;
          this.isLoading = false;
          this.initForm();
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  override getData(): void {
    if (this._dynamicDialogConfig.data?.rowData?.id) {
      const params = { id: this._dynamicDialogConfig.data.rowData.id };
      this._apiService
        .get(API_Config.timesheet.getById, params)
        .pipe(this._unsubscribe.takeUntilDestroy())
        .subscribe({
          next: (res: ApiRes) => {
            if (res && res.isSuccess) {
              this.formlyModel = { ...res.result };
              this.setForm();
            }
          },
        });
    }
  }

  initForm() {
    this.formlyFields = timsheeteAdditionalFilterFields(this);

    if (this._dynamicDialogConfig.data?.rowData?.id) {
      this.getData();
    } else {
      this.setForm();
    }

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
    if (!this.formlyModel || Object.keys(this.formlyModel).length === 0) {
      this.formlyModel = { ...this._dynamicDialogConfig.data.formlyModel };
    }
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
            'categoryId',
          );
          if (categoryField) {
            categoryField.props['optionsArr'] = [];
            categoryField.formControl.reset();
            categoryField.props['optionsArr'] = res?.result.map((obj: any) => ({
              label: obj.name,
              value: obj,
            }));
          }
        },
      });
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
            'matterTypeId',
          );
          if (matterTypeField) {
            matterTypeField.props['optionsArr'] = [];
            matterTypeField.formControl.reset();
            matterTypeField.props['optionsArr'] = res?.result.map(
              (obj: any) => ({ label: obj.name, value: obj }),
            );
          }
        },
      });
  }

  reset() {
    this.formlyModel = {};
    this.formly.reset();
  }
  onSubmit() {
    this.formly.markAllAsTouched();

    if (this.formly.valid) {
      this._dynamicDialogRef.close(this.formly.value);
    } else {
      console.log('Form has validation errors, cannot submit');
    }
  }
}
