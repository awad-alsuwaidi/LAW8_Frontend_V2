import { inject } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivateFn,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const authService: AuthService = inject(AuthService);
    const router: Router = inject(Router);
    if (authService?.getToken()) {
        return true
    }
    return router.createUrlTree(['/auth/login']);

};

export const NoAuthGuard: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getToken()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};


// export const NoAuthGuard: CanActivateFn = (
//     next: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot
// ) => {
//     const authService: AuthService = inject(AuthService);
//     const router: Router = inject(Router);
//     if (authService?.getToken()) {
//         return false;
//     }
//     router.createUrlTree(['/'])
//     return true
// };
