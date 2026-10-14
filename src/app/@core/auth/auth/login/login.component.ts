// import { HttpErrorResponse } from '@angular/common/http';
// import { Component, inject, OnInit } from '@angular/core';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { Auth_API } from '@core/api/api-config/auth';
// import { FormBaseClass } from '@core/classes/form-base.class';
// import { ApiRes } from '@core/models/apiRes-model';
// import { AuthService } from '@core/services';
// import { SharedButtonComponent } from '@shared/components/shared-button/shared-button.component';
// import { FormlyConfigModule } from '@shared/modules/formly-config/formly-config.module';
// import { TranslateModule } from '@ngx-translate/core';
// import { Message } from 'primeng/api';
// import { MessagesModule } from 'primeng/messages';
// import { finalize, switchMap, tap } from 'rxjs';
// import { SharedModule } from 'src/app/@shared/shared.module';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [
//     FormlyConfigModule,
//     TranslateModule,
//     FormsModule,
//     ReactiveFormsModule,
//     SharedButtonComponent,
//     MessagesModule,
//     SharedModule,
//   ],
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.scss',
// })
// export class LoginComponent extends FormBaseClass implements OnInit {
//   private _authService = inject(AuthService);
//   private router = inject(Router);
//   messages!: Message[];

//   ngOnInit(): void {
//     this.initForm();

//     const rememberedUser = localStorage.getItem('rememberedUser');
//     if (rememberedUser) {
//       const userData = JSON.parse(rememberedUser);
//       this.formlyModel = {
//         username: userData.username,
//         password: userData.password,
//         RememberMe: true,
//       };
//     }
//   }

//   initForm(): void {
//     this.formlyFields = [
//       {
//         fieldGroupClassName: 'flex flex-col gap-8',
//         fieldGroup: [
//           {
//             key: 'username',
//             type: 'input',
//             props: {
//               label: 'auth.username',
//               placeholder: 'auth.userNamePlaceholder',
//               required: true,
//             },
//           },
//           {
//             key: 'password',
//             type: 'input',
//             props: {
//               type: 'password',
//               label: 'auth.password',
//               placeholder: 'auth.passwordPlaceholder',
//               required: true,
//               feedback: false,
//             },
//           },
//           {
//             fieldGroupClassName: 'flex items-center justify-between mb-8',
//             fieldGroup: [
//               {
//                 key: 'RememberMe',
//                 type: 'checkbox',
//                 className: 'custom-circle-checkbox flex items-center gap-2',
//                 props: {
//                   label: this._languageService.getTransValue('auth.rememberMe'),
//                 },
//               },
//               {
//                 type: 'button',
//                 props: {
//                   label: 'auth.forgetPassword',
//                   class: 'text-primary text-sm !p-0',
//                   onClick: () => this._router.navigate(['/forget-password']),
//                 },
//               },
//             ],
//           },
//         ],
//       },
//     ];
//   }

//   onSubmit() {
//     if (this.formly.invalid) {
//       this.formly.markAllAsTouched();
//       return;
//     }

//     this.isLoading = true;

//     this._apiService
//       .post(Auth_API.auth.login, {
//         username: this.formlyModel.username,
//         password: this.formlyModel.password,
//       })
//       .pipe(
//     switchMap((res: any) => {
//   // ★ يدعم isSuccess و success (PascalCase بتاع .NET)
//   const ok = res?.isSuccess === true || res?.success === true;

//   if (!ok) {
//     throw { step: 'login', res };
//   }

//   // ★ احفظ اليوزر + الـ credentials قبل أي حاجة
//   this._authService.setUser({ userName: this.formlyModel.username });
//   this._authService.setLoginCredentials({
//     username: this.formlyModel.username,
//     password: this.formlyModel.password,
//   });

//   return this._authService.generatePkcePair();
// }),
// tap(() => {
//   if (!this._authService.codeChallenge || !this._authService.codeVerifier) {
//     throw { step: 'pkce' };
//   }
// }),
// finalize(() => (this.isLoading = false)),
//         // ★ الفحص الوحيد المطلوب: هل الـ PKCE اتخزن؟
//         tap(() => {
//           if (!this._authService.codeChallenge || !this._authService.codeVerifier) {
//             throw { step: 'pkce' };
//           }
//         }),
//         finalize(() => (this.isLoading = false))
//       )
//       .subscribe({
//         next: () => {
//           if (this.formlyModel.RememberMe) {
//             localStorage.setItem(
//               'rememberedUser',
//               JSON.stringify({
//                 username: this.formlyModel.username,
//                 password: this.formlyModel.password,
//               })
//             );
//           } else {
//             localStorage.removeItem('rememberedUser');
//           }

//           this.router.navigate(['/auth/otp']);
//         },
//         error: (err: HttpErrorResponse | any) => {
//           if (err?.step === 'login') {
//             this.showError(err.res?.message || 'Invalid credentials');
//           } else if (err?.step === 'pkce') {
//             this.showError('Failed to generate PKCE');
//           } else {
//             this.showError(
//               err?.error?.message || err?.message || 'Sign In error'
//             );
//           }
//         },
//       });
//   }

//   private showError(msg: string) {
//     this.messages = [
//       { severity: 'error', summary: 'Sign In error', detail: msg },
//     ];
//     setTimeout(() => (this.messages = []), 5000);
//   }
// }


//  TEMP ككل ده هيتمسح وارجع ال فوق لما الغي موضوع التينانت ال ف اللوجين ده
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth_API } from '@core/api/api-config/auth';
import { FormBaseClass } from '@core/classes/form-base.class';
import { ApiRes } from '@core/models/apiRes-model';
import { AuthService } from '@core/services';
import { SharedButtonComponent } from '@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from '@shared/modules/formly-config/formly-config.module';
import { TranslateModule } from '@ngx-translate/core';
import { Message } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { finalize, switchMap, tap } from 'rxjs';
import { SharedModule } from 'src/app/@shared/shared.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormlyConfigModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    SharedButtonComponent,
    MessagesModule,
    SharedModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent extends FormBaseClass implements OnInit {
  private _authService = inject(AuthService);
  private router = inject(Router);
  messages!: Message[];
  ngOnInit(): void {
    this.initForm();

    const savedTenant = this._authService.getTenantSubdomain();

    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      const userData = JSON.parse(rememberedUser);
      this.formlyModel = {
        tenantSubdomain: userData.tenantSubdomain ?? savedTenant,
        username: userData.username,
        password: userData.password,
        RememberMe: true,
      };
    } else {
      this.formlyModel = {
        tenantSubdomain: savedTenant,
      };
    }
  }

  onSubmit() {
    if (this.formly.invalid) {
      this.formly.markAllAsTouched();
      return;
    }
    const tenant = this.formlyModel.tenantSubdomain?.trim().toLowerCase();
    if (!tenant) {
      this.showError('Tenant Subdomain is required');
      return;
    }
    this._authService.setTenantSubdomain(tenant);

    this.isLoading = true;

    this._apiService
      .post(Auth_API.auth.login, {
        username: this.formlyModel.username,
        password: this.formlyModel.password,
      })
      .pipe(
        switchMap((res: any) => {
          const ok = res?.isSuccess === true || res?.success === true;
          if (!ok) throw { step: 'login', res };

          this._authService.setUser({ userName: this.formlyModel.username });
          this._authService.setLoginCredentials({
            username: this.formlyModel.username,
            password: this.formlyModel.password,
          });

          return this._authService.generatePkcePair();
        }),
        tap(() => {
          if (
            !this._authService.codeChallenge ||
            !this._authService.codeVerifier
          ) {
            throw { step: 'pkce' };
          }
        }),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: () => {
          if (this.formlyModel.RememberMe) {
            localStorage.setItem(
              'rememberedUser',
              JSON.stringify({
                tenantSubdomain: tenant,
                username: this.formlyModel.username,
                password: this.formlyModel.password,
              }),
            );
          } else {
            localStorage.removeItem('rememberedUser');
          }

          this.router.navigate(['/auth/otp']);
        },
        error: (err: HttpErrorResponse | any) => {
          if (err?.step === 'login') {
            this.showError(err.res?.message || 'Invalid credentials');
          } else if (err?.step === 'pkce') {
            this.showError('Failed to generate PKCE');
          } else {
            this.showError(
              err?.error?.message || err?.message || 'Sign In error',
            );
          }
        },
      });
  }

  initForm(): void {
    this.formlyFields = [
      {
        fieldGroupClassName: 'flex flex-col gap-8',
        fieldGroup: [
          //  TEMP
          {
            key: 'tenantSubdomain',
            type: 'input',
            props: {
              label: 'Tenant Subdomain',
              placeholder: 'e.g. taha',
              required: true,
              description: 'Organization identifier (temporary)',
            },
          },

          {
            key: 'username',
            type: 'input',
            props: {
              label: 'auth.username',
              placeholder: 'auth.userNamePlaceholder',
              required: true,
            },
          },
          {
            key: 'password',
            type: 'input',
            props: {
              type: 'password',
              label: 'auth.password',
              placeholder: 'auth.passwordPlaceholder',
              required: true,
              feedback: false,
            },
          },
          {
            fieldGroupClassName: 'flex items-center justify-between mb-8',
            fieldGroup: [
              {
                key: 'RememberMe',
                type: 'checkbox',
                className: 'custom-circle-checkbox flex items-center gap-2',
                props: {
                  label: this._languageService.getTransValue('auth.rememberMe'),
                },
              },
              {
                type: 'button',
                props: {
                  label: 'auth.forgetPassword',
                  class: 'text-primary text-sm !p-0',
                  onClick: () => this._router.navigate(['/forget-password']),
                },
              },
            ],
          },
        ],
      },
    ];
  }

  private showError(msg: string) {
    this.messages = [
      { severity: 'error', summary: 'Sign In error', detail: msg },
    ];
    setTimeout(() => (this.messages = []), 5000);
  }
}
