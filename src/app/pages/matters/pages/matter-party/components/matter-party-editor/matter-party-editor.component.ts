import { Component, inject, OnInit } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { matterPartyEditorFieldsConfig } from './matter-party-editor-formly.config';
import { SharedModule } from 'src/app/@shared/shared.module';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-matter-party-editor',
  standalone: true,
  imports: [
    SharedModule,
    FormlyConfigModule,
    SharedButtonComponent
  ],
  templateUrl: './matter-party-editor.component.html',
  styleUrl: './matter-party-editor.component.scss'
})
export class MatterPartyEditorComponent extends FormBaseClass implements OnInit {
  matterIdentifier: any;
  isSaveAndNew!: boolean;
  ngOnInit(): void {
    this.getLookupsData()
  }
  override initForm(): void {
    this.formlyFields = matterPartyEditorFieldsConfig(this)
    this.setFormData()
  }
  setFormData() {
    this.formlyModel = { ...this._dynamicDialogConfig.data.rowData }
    this.matterIdentifier = this._dynamicDialogConfig.data.matterIdentifier;
    if (this._dynamicDialogConfig.data.rowData) this.getPositionByDescriptionId(this.formlyModel.law_PartiesDescriptionId)
  }
  override getLookupsData() {
    combineLatest({
      partyDescription: this._apiService.get(API_Config.general.getPartiesDescription),
      partyType: this._apiService.get(API_Config.general.getPartyTypes),
    }).pipe(
      this._unsubscribe.takeUntilDestroy()
    ).subscribe((res) => {
      this.lookupsData = res;
      this.initForm();
    })
  }
  getPositionByDescriptionId(descriptionId: any) {
    const param = {
      Law_MatterId:
        this.matterIdentifier,
      Law_PartiesDescriptionId: descriptionId,
    }
    this._apiService
      .get(API_Config.general.getPartyPosition, param)
      .subscribe({
        next: (res: ApiRes) => {
          const positionField: FormlyFieldConfig = findField(this.formlyFields, 'position')
          if (positionField && positionField.props) {
            positionField.props['optionsArr'] = res.result.map((obj: any) => ({
              label: obj.name,
              value: obj.id,
            }));
            if (this._dynamicDialogConfig.data.rowData) {
              const missedOption = { value: this.formlyModel?.position, label: this.formlyModel?.position?.toString() }
              positionField.props['optionsArr'].push(missedOption)
            }
          }
          this.formlyModel = { ...this.formlyModel }
        },
      });
  }
  saveAndNew() {
    this.isSaveAndNew = true;
    this.onSubmit()
  }
  reset() {
    this.formlyModel = {};
    this.formly.reset();
  }
  override onSubmit(): void {
    if (this.formly.invalid) return;
    this.isLoading = true;
    if (this._router.url.includes('add')) {
      this._dynamicDialogRef.close(this.formlyModel);
      return
    }
    const requestPayload = this._dynamicDialogConfig?.data?.rowData
      ? {
        ...this.formlyModel,
        id: this._dynamicDialogConfig?.data?.rowData?.id,
      }
      : {
        ...this.formlyModel,
        law_MatterId: this.matterIdentifier
      };

    const path = this._dynamicDialogConfig?.data?.rowData
      ? API_Config.matterParties.update
      : API_Config.matterParties.create;

    this._apiService
      .post(path, requestPayload)
      .pipe(
        finalize(() => this.isLoading = false),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this._toastrNotifiService.displaySuccess(res?.message);
            this.reset()
            if (!this.isSaveAndNew) this._dynamicDialogRef.close(true)
            this.isSaveAndNew = false
          } else {
            this._toastrNotifiService.displayError(res?.message);
          }
        },
        error: (err: any) => {
          this._toastrNotifiService.displayError(err?.error?.message);
        },
      });
  }

}
