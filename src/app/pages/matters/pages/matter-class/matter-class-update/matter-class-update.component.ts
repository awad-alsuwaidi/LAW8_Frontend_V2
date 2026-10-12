import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { matterClassFieldsConfig } from './matter-class-fomrly.config';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';

@Component({
  selector: 'app-matter-class-update',
  standalone: true,
  imports: [
    SharedModule,
    FormlyConfigModule,
    SharedButtonComponent
  ],
  templateUrl: './matter-class-update.component.html',
  styleUrl: './matter-class-update.component.scss'
})
export class MatterClassUpdateComponent extends FormBaseClass implements OnInit {
  matterIdentifier: any;
  ngOnInit(): void {
    this.initForm()
  }
  override initForm(): void {
    this.formlyFields = matterClassFieldsConfig(this)
    this.setFormData()
  }
  setFormData() {
    this.formlyModel = { ...this._dynamicDialogConfig.data.rowData }
    this.matterIdentifier = this._dynamicDialogConfig.data.matterIdentifier;

  }

  reset() {
    this.formlyModel = {};
  }
  override onSubmit(): void {
    if (this.formly.invalid) return;
    this.isLoading = true
    if (this._router.url.includes('add')) {
      this._dynamicDialogRef.close(this.formlyModel);
      return
    }

    this._apiService
      .post(API_Config.matterClass.update, this.formlyModel)
      .pipe(
        finalize(() => this.isLoading = false),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this._toastrNotifiService.displaySuccess(res?.message);
            this._dynamicDialogRef.close(true);
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
