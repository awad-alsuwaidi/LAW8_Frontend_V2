import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Message } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { finalize, interval, switchMap, take } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { Auth_API } from 'src/app/@core/api/api-config/auth';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { AuthService } from 'src/app/@core/services';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SecondsToTimePipe } from 'src/app/@shared/services/secondsToTime/seconds-to-time.pipe';
import { SharedModule } from 'src/app/@shared/shared.module';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    MessagesModule,
    SecondsToTimePipe,
    SharedModule,
  ],
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss'],
  providers: [SecondsToTimePipe],
})
export class OtpComponent extends FormBaseClass implements OnInit {
  _authService = inject(AuthService);
  _cdRef = inject(ChangeDetectorRef);
  _permissionService = inject(PermissionService);
  _translate = inject(TranslateService);

  counterInSeconds!: number;
  messages: Message[] = [];
  override isLoading: boolean = false;

  ngOnInit(): void {
    this.initForm();
    this.countDown();

    if (!this._authService.user) {
      this._router.navigate(['/auth/login']);
      return;
    }

    // لو PKCE مش متولّد (refresh للصفحة) ولّده
    if (!this._authService.codeChallenge) {
      this._authService.generatePkcePair().subscribe();
    }
  }

  override initForm(): void {
    this.formlyFields = [
      {
        fieldGroupClassName: 'flex flex-col gap-8',
        fieldGroup: [
          { key: 'otp', type: 'otp', props: { required: true, length: 5 } },
          { key: 'username', defaultValue: this._authService.user?.userName },
        ],
      },
    ];
  }

onSubmit() {
  if (this.formly.invalid) {
    this.formly.markAllAsTouched();
    return;
  }

  const username = this._authService.user?.userName;
  const codeChallenge = this._authService.codeChallenge;
  const codeVerifier = this._authService.codeVerifier;

  if (!username || !codeChallenge || !codeVerifier) {
    this.showOtpError();
    return;
  }

  this.isLoading = true;
  this.messages = [];

  const redirectUri = this._authService.redirectUri;

  // ★ verify-otp → auth code → token → me
  this._authService
    .verifyOtp({
      username,
      otp: this.formlyModel.otp,
      codeChallenge,
      redirectUri,
    })
    .pipe(
      switchMap((verifyRes: any) => {
        const ok = verifyRes?.isSuccess === true || verifyRes?.success === true;
        const body = verifyRes?.result ?? verifyRes?.data;

        if (!ok || !body) {
          throw { step: 'verify', res: verifyRes };
        }

        const authCode: string = body?.code?.code ?? body?.code ?? body;

        if (!authCode || typeof authCode !== 'string') {
          throw { step: 'verify', res: verifyRes };
        }

        return this._authService.exchangeToken({
          code: authCode,
          codeVerifier,
          redirectUri,
        });
      }),

      // ★ بعد نجاح التوكن، نجيب /me
      switchMap((tokenRes: any) => {
        const ok = tokenRes?.isSuccess === true || tokenRes?.success === true;
        const body = tokenRes?.result ?? tokenRes?.data;

        if (!ok || !body) {
          throw { step: 'token', res: tokenRes };
        }

        const accessToken: string =
          body?.accessToken ??
          body?.token ??
          (typeof body === 'string' ? body : null);
        const refreshToken: string | undefined =
          body?.refreshToken ?? body?.refresh_token;

        if (!accessToken || typeof accessToken !== 'string') {
          throw { step: 'token', res: tokenRes };
        }

        // ★ خزّن التوكنز الأول عشان الطلبات الجاية (زي /me) تبقى authorized
        this._authService.setTokens(accessToken, refreshToken);

        // ★ نجيب /me
        return this._apiService.get<any>(Auth_API.auth.me);
      }),

      finalize(() => (this.isLoading = false))
    )
    .subscribe({
      next: (meRes: any) => {
        const ok = meRes?.isSuccess === true || meRes?.success === true;
        const me = meRes?.result ?? meRes?.data;

        if (!ok || !me) {
          console.error('❌ Invalid /me response:', meRes);
          this.showOtpError();
          return;
        }

        // ★ خزّن اليوزر + حمّل الصلاحيات
        this._authService.setUser(me);
        this._permissionService.loadFromMe(me);

        this._authService.clearPkce();

        this._toastrNotifiService.displaySuccess(
          meRes.message || 'Logged in successfully'
        );

        this._router.navigateByUrl('/lookups').then((nav) => {
          if (!nav) {
            console.error('❌ Navigation to /lookups failed — check guards');
          }
        });
      },
      error: (err: HttpErrorResponse | any) => {
        console.error('❌ OTP flow error:', err);

        if (err?.step === 'verify' || err?.step === 'token') {
          this.showOtpError();
          return;
        }

        // لو المشكلة في /me، نعرض خطأ عام
        this.showOtpError();
      },
    });
}

  private showOtpError() {
    this.messages = [
      {
        severity: 'error',
        detail: this._languageService.getTransValue('auth.erorrOTP'),
        icon: 'icon-error-circle',
      },
    ];
    setTimeout(() => (this.messages = []), 5000);
  }

resendOtp() {
  const creds = this._authService.getLoginCredentials();
  if (!creds) {
    // لو الـ credentials مش موجودة (refresh للصفحة) نرجع المستخدم لصفحة اللوجين
    this._router.navigate(['/auth/login']);
    return;
  }

  this.isLoading = true;

  // ★ نعيد استدعاء Auth/login عشان الباك يبعت OTP جديدة
  this._apiService
    .post(Auth_API.auth.login, {
      username: creds.username,
      password: creds.password,
    })
    .pipe(
      this._unsubscribe.takeUntilDestroy(),
      finalize(() => (this.isLoading = false))
    )
    .subscribe({
      next: (res: ApiRes) => {
        if (res?.isSuccess) {
          // نجدد الـ PKCE لأن الباك بيولّد one جديد مع كل login
          this._authService.generatePkcePair().subscribe({
            next: (pkceRes) => {
              if (pkceRes?.isSuccess) this.countDown();
            },
          });
        }
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
}