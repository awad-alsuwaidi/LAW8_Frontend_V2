import { Component, inject, OnInit } from '@angular/core';
import { Message } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { finalize } from 'rxjs';
import { Auth_API } from 'src/app/@core/api/api-config/auth';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { AuthService } from 'src/app/@core/services';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';

@Component({
  selector: 'app-forgetpassword-email',
  standalone: true,
  imports: [FormlyConfigModule, SharedButtonComponent, MessagesModule, SharedModule],
  templateUrl: './forgetpassword-email.component.html',
  styleUrl: './forgetpassword-email.component.scss',
})
export class ForgetpasswordEmailComponent extends FormBaseClass implements OnInit {
  _authService = inject(AuthService);
  messages!: Message[];

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.formlyFields = [
      {
        key: 'userName', // ★ الاسم الجديد (userName مش email)
        type: 'input',
        props: {
          label: this._languageService.getTransValue('auth.email'),
          placeholder: this._languageService.getTransValue('auth.emailPlaceholder'),
          required: true,
        },
      },
    ];
  }

  onSubmit() {
    if (this.formly.invalid) {
      this.formly.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this._apiService
      .post(Auth_API.auth.forgotPassword, { userName: this.formlyModel.userName })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess) {
            this._authService.user = { userName: this.formlyModel.userName };
            this._router.navigate(['/forget-password/otp']);
          } else {
            this.messages = [{ severity: 'error', detail: res.message, icon: 'icon-error-circle' }];
          }
        },
        error: () => {
          this._toastrNotifiService.displayError(
            this._languageService.getTransValue('messages.signInError')
          );
        },
      });
  }
}