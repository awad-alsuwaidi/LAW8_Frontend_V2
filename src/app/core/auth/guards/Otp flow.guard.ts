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
export class OtpFlowGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const username = this.authService.getUsername();
    const codeChallenge = this.authService.getCodeChallenge();

    if (username && codeChallenge) {
      console.log('[OtpFlowGuard] Valid flow. User:', username);
      return true;  
    }
    console.warn(
      '[OtpFlowGuard] Invalid OTP flow. Missing required data:',
      {
        username: !!username,
        codeChallenge: !!codeChallenge,
      }
    );

    return this.router.createUrlTree(['/auth/login']);
  }
}

export const otpFlowGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const username = authService.getUsername();
  const codeChallenge = authService.getCodeChallenge();

  if (username && codeChallenge) {
    console.log('[otpFlowGuard] Valid flow. User:', username);
    return true;
  }

  console.warn('[otpFlowGuard] Invalid OTP flow. Redirecting to login.');
  return router.createUrlTree(['/auth/login']);
};