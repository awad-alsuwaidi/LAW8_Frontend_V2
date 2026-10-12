import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Message } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessagesModule } from 'primeng/messages';
import { finalize } from 'rxjs';
import { Auth_API } from 'src/app/@core/api/api-config/auth';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { AuthService } from 'src/app/@core/services';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';

@Component({
  selector: 'app-forgetpassword-change-password',
  standalone: true,
  imports: [FormlyConfigModule, SharedButtonComponent, TranslateModule, RouterModule, MessagesModule],
  templateUrl: './forgetpassword-change-password.component.html',
  styleUrl: './forgetpassword-change-password.component.scss',
  providers: [
    { provide: DynamicDialogConfig, useValue: { data: {} } },
    { provide: DynamicDialogRef, useValue: { close: () => {} } },
  ],
})
export class ForgetpasswordChangePasswordComponent extends FormBaseClass implements OnInit {
  _authService = inject(AuthService);
  messages!: Message[];

  ngOnInit() {
    if (!this._authService.user?.userName) {
      this._router.navigate(['/forget-password']);
      return;
    }
    this.initForm();
  }

  initForm() {
    this.formlyFields = [
      {
        fieldGroupClassName: 'flex flex-col gap-8',
        fieldGroup: [
          {
            key: 'newPassword',
            type: 'password',
            props: {
              label: this._languageService.getTransValue('auth.password'),
              required: true,
            },
            validators: {
              strongPassword: {
                expression: (control: AbstractControl) => {
                  if (!control.value) return false;
                  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$/.test(control.value);
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
                message: this._languageService.getTransValue('validation.passwordNotMatching'),
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
          },
        ],
      },
    ];
  }

  onSubmit() {
    this.formly.markAllAsTouched();
    if (this.formly.invalid) return;

    this.isLoading = true;

    this._apiService
      .post(Auth_API.auth.resetPassword, {
        userName: this._authService.user.userName,
        token: this._authService.user.resetToken,
        newPassword: this.formlyModel.newPassword,
      })
      .pipe(
        this._unsubscribe.takeUntilDestroy(),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            const confirmDialog = this._dialogService.open(SharedConfirmDialogComponent, {
              modal: true,
              width: '30vw',
              data: {
                title: this._languageService.getTransValue('auth.yourSuccessfullyChangedYourPassword'),
                message: this._languageService.getTransValue('auth.youCanLoginNow'),
                btns: [
                  {
                    label: this._languageService.getTransValue('auth.backToLogin'),
                    styleClass: 'bg-primary text-white',
                    command: () => {
                      confirmDialog.close();
                      this._router.navigate(['/auth/login']);
                    },
                  },
                ],
              },
            });

            confirmDialog.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
              next: (r: any) => {
                if (r) this._router.navigate(['/auth/login']);
              },
            });
          } else {
            this.messages = [{ severity: 'error', detail: res?.message || 'Something went wrong' }];
          }
        },
        error: (err) => {
          this.messages = [
            {
              severity: 'error',
              detail: err?.error?.message || err?.message || 'Something went wrong',
            },
          ];
        },
      });
  }
}