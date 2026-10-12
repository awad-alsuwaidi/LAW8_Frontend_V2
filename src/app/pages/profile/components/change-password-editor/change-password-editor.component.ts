import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-change-password-editor',
  standalone: true,
  imports: [FormlyConfigModule, SharedButtonComponent, SharedModule],
  templateUrl: './change-password-editor.component.html',
  styleUrl: './change-password-editor.component.scss',
})
export class ChangePasswordEditorComponent
  extends FormBaseClass
  implements OnInit
{
  private _dialogRef = inject(DynamicDialogRef);
  isSubmitting = false;

  ngOnInit(): void {
    this.initForm();
  }
  initForm() {
this.formlyFields = [
{
  fieldGroup: [
  {
  key: 'newPassword',
  type: 'password',
  props: {
    label: this._languageService.getTransValue('common.password'),
    required: true,
  },
  validators: {
    strongPassword: {
      expression: (control: AbstractControl) => {
        if (!control.value) return false;

        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$/.test(
          control.value
        );
      },
      message: this._languageService.getTransValue('validation.password'),
    },
  },
},
{
  key: 'confirmPassword',
  type: 'password',
  props: {
    label: this._languageService.getTransValue('auth.confirmPassword'),
    required: true,
  },

  validators: {
    fieldMatch: {
      expression: (control: AbstractControl) => {
        const newPass = control.parent?.get('newPassword')?.value;
        return control.value === newPass;
      },
      message: this._languageService.getTransValue(
        'validation.passwordNotMatching'
      ),
    },
  },
  hooks: {
    onInit: (field) => {
      const newPassCtrl = field.form?.get('newPassword');
      newPassCtrl?.valueChanges.subscribe(() => {
        field.formControl?.updateValueAndValidity();
      });
    },
  },
}
  ],
  validators: {
    passwordMatch: {
      expression: (control: AbstractControl) => {
        const newPass = control.get('newPassword')?.value;
        const confirm = control.get('confirmPassword')?.value;
        return newPass === confirm;
      },
      message: this._languageService.getTransValue(
        'validation.passwordNotMatching'
      ),
    },
  },

  validation: {
    show: true,
  },
}
    ];
  }


override onSubmit(): void {
  if (this.formly.invalid) {
    this.formly.markAllAsTouched();
    return;
  }

  if (this.isSubmitting) return;

  this.isSubmitting = true;
  delete this.formlyModel.confirmPassword;
  this._apiService
    .post(API_Config.auth.changePassword, this.formlyModel)
    .pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
  next: (res: ApiRes) => {
    if (res.isSuccess) {
      this._toastrNotifiService.displaySuccess(res.message);
      this._dialogRef.close(true);
    } else {
      this._toastrNotifiService.displayError(res.message);
    }
    this.isSubmitting = false;
  },
  error: (err) => {
    this._toastrNotifiService.displayError(
      err?.error?.message || 'Something went wrong'
    );
    this.isSubmitting = false;
  },
});
}

}
