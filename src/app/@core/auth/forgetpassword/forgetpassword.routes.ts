import { Routes } from "@angular/router";


export const FORGET_PASSWORD_ROUTES: Routes = [
    {
      path: '',
      loadComponent: () => import('./forgetpassword-email/forgetpassword-email.component').then(m => m.ForgetpasswordEmailComponent)
    },
    {
      path: 'otp',
      loadComponent: () => import('./forgetpassword-otp/forgetpassword-otp.component').then(m => m.ForgetpasswordOtpComponent)
    },
    {
      path: 'change-password',
      loadComponent: () => import('./forgetpassword-change-password/forgetpassword-change-password.component').then(m => m.ForgetpasswordChangePasswordComponent)
    },
];
