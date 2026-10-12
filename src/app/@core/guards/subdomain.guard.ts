import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { SubdomainService } from 'src/app/@shared/services/subdomain.service';

export const SubdomainGuard: CanActivateFn = () => {
  const subService = inject(SubdomainService);
  const router = inject(Router);

  const sub = subService.getSubdomain();

  if (window.location.pathname.includes('connect-admin')) {
    return true;
  }

  if (sub === 'localhost') return true;

  return subService.validate(sub).pipe(
    map(() => true),
    catchError(() => {
      router.navigate(['/connect-admin']);
      return of(false);
    })
  );
};