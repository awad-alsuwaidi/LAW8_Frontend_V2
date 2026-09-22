import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ResetOtpFlowGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const username = this.authService.getUsername();
    const otpFlow = this.authService.getOtpFlow();

    if (username && otpFlow === 'reset') {
      return true;
    }


    return this.router.createUrlTree(['/auth/forgot-password']);
  }
}

export const resetOtpFlowGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const username = authService.getUsername();
  const otpFlow = authService.getOtpFlow();

  if (username && otpFlow === 'reset') {
    return true;
  }

  return router.createUrlTree(['/auth/forgot-password']);
};
