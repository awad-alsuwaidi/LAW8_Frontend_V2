import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login-page/login-page';
import { VerifyOtpPage } from './pages/verify-otp/verify-otp-page/verify-otp-page';
import { ChangePasswordPage } from './pages/change-password/change-password-page/change-password-page';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password-page/forgot-password-page';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginPage,
    data: { title: 'تسجيل الدخول' }
  },
  {
    path: 'verify-otp',
    component: VerifyOtpPage,
    data: { title: 'التحقق من الرمز' }
  },
  {
    path: 'change-password',
    component: ChangePasswordPage,
    data: { title: 'تغيير كلمة المرور' }
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordPage,
    data: { title: 'استعادة كلمة المرور' }
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
