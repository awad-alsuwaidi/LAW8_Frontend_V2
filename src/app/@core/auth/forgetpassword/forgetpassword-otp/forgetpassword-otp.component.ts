import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Message } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { finalize, interval, take } from 'rxjs';
import { Auth_API } from 'src/app/@core/api/api-config/auth';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { AuthService } from 'src/app/@core/services';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SecondsToTimePipe } from 'src/app/@shared/services/secondsToTime/seconds-to-time.pipe';
import { SharedModule } from 'src/app/@shared/shared.module';

@Component({
  selector: 'app-forgetpassword-otp',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    SharedModule,
    SecondsToTimePipe,
    MessagesModule,
  ],
  providers: [SecondsToTimePipe],
  templateUrl: './forgetpassword-otp.component.html',
  styleUrl: './forgetpassword-otp.component.scss',
})
export class ForgetpasswordOtpComponent
  extends FormBaseClass
  implements OnInit
{
  _authService = inject(AuthService);
  _cdRef = inject(ChangeDetectorRef);
  counterInSeconds!: number;
  messages!: Message[];
  override isLoading = true;

  ngOnInit(): void {
    this.initForm();
    if (!this._authService.user?.userName) {
      this._router.navigate(['/forget-password']);
      return;
    }
    this.countDown();
  }

  override initForm(): void {
    this.formlyFields = [
      { key: 'otp', type: 'otp', props: { required: true, length: 5 } },
    ];
  }

  resendOtp() {
    if (!this._authService.user?.userName) return;
    this.isLoading = true;
    this._apiService
      .post(Auth_API.auth.forgotPassword, {
        userName: this._authService.user.userName,
      })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) this.countDown();
        },
      });
  }

  countDown() {
    this.counterInSeconds = 300;
    interval(1000)
      .pipe(take(this.counterInSeconds))
      .subscribe({
        next: () => this.counterInSeconds--,
        complete: () => {
          this.isLoading = false;
          this._cdRef.detectChanges();
        },
      });
  }

  onSubmit() {
    if (this.formly.invalid) return;
    this.isLoading = true;
    this._apiService
      .post(Auth_API.auth.verifyResetOtp, {
        userName: this._authService.user.userName,
        otp: this.formlyModel.otp,
      })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess) {
            // ★ استخرج الـ string من أي شكل ممكن يرجعه الباك
            const result: any = res.result;
            const resetToken: string =
              result?.resetToken ?? // { resetToken: "..." }
              result?.token?.resetToken ?? // { token: { resetToken: "..." } }
              result?.token ?? // { token: "..." }
              result; // string مباشر

            this._authService.user = {
              ...this._authService.user,
              resetToken,
            };

            console.log('🔑 Reset Token:', resetToken); // عشان تتأكد
            this._router.navigate(['/forget-password/change-password']);
          } else {
            this.messages = [
              {
                severity: 'error',
                detail: res.message,
                icon: 'icon-error-circle',
              },
            ];
          }
        },
        error: () => {
          this._toastrNotifiService.displayError(
            this._languageService.getTransValue('messages.signInError'),
          );
        },
      });
  }
}
