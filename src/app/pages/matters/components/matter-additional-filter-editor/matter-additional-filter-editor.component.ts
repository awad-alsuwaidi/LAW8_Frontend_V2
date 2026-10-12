import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { matterAdditionalFilterFields } from './matter-additional-filter-editor.config';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { combineLatest } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import {  TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-matter-additional-filter-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    TranslateModule
  ],
  templateUrl: './matter-additional-filter-editor.component.html',
  styleUrl: './matter-additional-filter-editor.component.scss'
})
export class MatterAdditionalFilterEditorComponent extends FormBaseClass implements OnInit {
  ngOnInit(): void {
    this.getLookupsData()
  }
  override getLookupsData(): void {
    combineLatest({
      clients: this._apiService.get(API_Config.general.getClients),
      practiceArea: this._apiService.get(API_Config.general.getPractsAreaLookup),
      status:this._apiService.get(API_Config.general.getMatterStatus)
    }).pipe(
      this._unsubscribe.takeUntilDestroy()
    ).subscribe((res) => {
      this.lookupsData = res;
      this.initForm();
    })
  }
  initForm() {
    this.formlyFields = matterAdditionalFilterFields(this);
    this.setForm()
  }
  setForm() {
    this.formlyModel = { ...this._dynamicDialogConfig.data.formlyModel }
  }
  getMatterCategoryByPracticeAreaOptions(practiceArea: number) {
    this._apiService
      .get(
        `${API_Config.general.getMatterCategoriesLookup}?PractsAreaId=${practiceArea}`
      )
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          const categoryField: FieldTypeConfig = findField(this.formlyFields, 'categoryId');
          if (categoryField) {
            categoryField.props['optionsArr']=[]
            categoryField.formControl.reset()
            categoryField.props['optionsArr'] = res?.result.map((obj: any) => ({ label: obj.name, value: obj }))
          }
        }
      })
  }
  getMatterTypeByMatterCategoryOptions(matterCategory: number) {
    this._apiService
      .get(
        `${API_Config.general.getMatterTypesByCategoryId}?matClntId=${matterCategory}`
      )
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          const matterTypeField: FieldTypeConfig = findField(this.formlyFields, 'matterTypeId');
          if (matterTypeField) {
            matterTypeField.props['optionsArr']=[]
            matterTypeField.formControl.reset()
            matterTypeField.props['optionsArr'] = res?.result.map((obj: any) => ({ label: obj.name, value: obj }))
          }
        }
      })
  }

  reset() {
    this.formlyModel = {}
    this.formly.reset()
  }
  onSubmit() {
    this._dynamicDialogRef.close(this.formly.value)
  }
}
