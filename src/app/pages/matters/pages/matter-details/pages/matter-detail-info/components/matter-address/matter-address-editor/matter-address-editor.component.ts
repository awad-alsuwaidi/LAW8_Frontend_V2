import { Component, OnInit } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { matterAddressFormlyFields } from './matter-address-editor-formly.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { combineLatest, finalize } from 'rxjs';

@Component({
  selector: 'app-matter-address-editor',
  standalone: true,
  imports: [
    SharedModule,
    FormlyConfigModule,
    SharedButtonComponent
  ],
  templateUrl: './matter-address-editor.component.html',
  styleUrl: './matter-address-editor.component.scss'
})
export class MatterAddressEditorComponent extends FormBaseClass implements OnInit {
  isSaveAndNew!:boolean;
  ngOnInit(): void {
    this.getLookupsData();
  }

  override getLookupsData() {
    combineLatest({
      country: this._apiService.get(API_Config.general.getCountryLookup),
    }).pipe(
      this._unsubscribe.takeUntilDestroy()
    ).subscribe((res) => {
      this.lookupsData = res;
      this.initForm();
    })
  }
  override initForm(): void {
    this.formlyFields = matterAddressFormlyFields(this);
    this.setFormData()
  }
  setFormData() {
    this.formlyModel = { ...this._dynamicDialogConfig.data.rowData }
  }
  reset() {
    this.formlyModel = {};
    this.formly.reset();
  }
  saveAndNew(){
    this.isSaveAndNew=true;
    this.onSubmit()
  }
  override onSubmit(): void {
    if (this.formly.invalid) {
      this.formly.markAllAsTouched();
      return;
    }
    this.isLoading=true
    const requestPayload = this._dynamicDialogConfig?.data?.rowData
      ? {
        ...this.formlyModel,
        id: this._dynamicDialogConfig?.data?.rowData?.id,
      }
      : {
        ...this.formlyModel,
        law_MatterId: this._dynamicDialogConfig?.data?.matterIdentifier,
      };
    const path = this._dynamicDialogConfig?.data?.rowData
      ? API_Config.matterAddress.update
      : API_Config.matterAddress.create;
    this._apiService
      .post(path, requestPayload)
      .pipe(
        finalize(()=>this.isLoading=false),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this._toastrNotifiService.displaySuccess(res?.message);
            this.reset()
            if(!this.isSaveAndNew)this._dynamicDialogRef.close(true);

            this.isSaveAndNew=false
            
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
