import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login-page/login-page';
import { VerifyOtpPage } from './pages/verify-otp/verify-otp-page/verify-otp-page';
import { verifyResetOtp } from './pages/verifyResetOtp/verifyResetOtp-page';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password-page/forgot-password-page';
import { NoAuthGuard } from '../../core/auth/guards/auth routes.guard';
import { OtpFlowGuard } from '../../core/auth/guards/Otp flow.guard';
import { ResetOtpFlowGuard } from '../../core/auth/guards/Reset otp flow.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [NoAuthGuard],
    component: LoginPage,
    data: { title: 'تسجيل الدخول' },
  },
  {
    path: 'verify-otp',
    canActivate: [OtpFlowGuard],
    component: VerifyOtpPage,
    data: { title: 'التحقق من الرمز' },
  },
  {
    path: 'verifyResetOtp',
    canActivate: [ResetOtpFlowGuard],
    component: verifyResetOtp,
    data: { title: 'تغيير كلمة المرور' },
  },
  {
    path: 'forgot-password',
    canActivate: [NoAuthGuard],
    component: ForgotPasswordPage,
    data: { title: 'استعادة كلمة المرور' },
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('./pages/change-password/change-password-page/change-password-page').then(
        (c) => c.ChangePasswordPage,
      ),
    data: { title: 'تغيير كلمة المرور' },
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
