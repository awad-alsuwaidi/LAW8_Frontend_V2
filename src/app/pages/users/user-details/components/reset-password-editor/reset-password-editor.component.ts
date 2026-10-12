import { Component, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';

@Component({
  selector: 'app-reset-password-editor',
  standalone: true,
  imports: [FormlyConfigModule, SharedButtonComponent, SharedModule],
  templateUrl: './reset-password-editor.component.html',
  styleUrl: './reset-password-editor.component.scss',
})
export class ResetPasswordEditorComponent
  extends FormBaseClass
  implements OnInit
{
  ngOnInit(): void {
    this.initForm();
  }
  initForm() {
    this.formlyFields = [
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
      expression: (control: any, field: any) =>
        control.value === field.model?.newPassword,
      message: this._languageService.getTransValue(
        'validation.passwordNotMatching'
      ),
    },
  },

  // expressionProperties: {
  //   'props.disabled': (model) =>
  //     !model?.newPassword || this.formly.get('newPassword')?.invalid,
  // },
  hooks: {
    onInit: (field) => {
      field.form?.get('newPassword')?.valueChanges.subscribe(() => {
        field.formControl?.updateValueAndValidity();
      });
    },
  },
}
    ];
  }
override onSubmit(): void {
  if (this.formly.invalid) {
    this.formly.markAllAsTouched();
    return;
  }

  const userId = this._dynamicDialogConfig.data?.userId;

  if (!userId) {
    this._toastrNotifiService.displayError('User ID is required');
    return;
  }

  // ★ بس newPassword — مفيش confirmPassword ولا userId في الـ body
  const payload = {
    newPassword: this.formlyModel.newPassword,
  };

  // ★ RESTful: POST /api/v1/tenant/users/{id}/reset-password
  this._apiService
    .put(`${API_Config.users.resetPassword}/${userId}/reset-password`, payload)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res: any) => {
        if (res?.isSuccess || res?.success) {
          this._toastrNotifiService.displaySuccess(res?.message || 'Password reset');
          this._dynamicDialogRef.close(true);
        } else {
          this._toastrNotifiService.displayError(
            res?.message || 'Something went wrong'
          );
        }
      },
      error: (err) => {
        this._toastrNotifiService.displayError(
          err?.error?.message || 'Something went wrong'
        );
      },
    });
}
}
