import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  inject,
  InjectionToken,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Auth_API } from './@core/api/api-config/auth';
import { AuthService } from './@core/services';
import { PermissionService } from './@core/services/permission.service';
import { UnsubscribeService } from './@shared/services/unsubscribe/unsubscribe.service';
import { SharedService } from './@shared/services/shared.service';
import { ApiService } from './@core/api/api.service';

export const CUSTOM_UNSUBSCRIBE_TOKEN = new InjectionToken<UnsubscribeService>(
  'CustomUnsubscribeService',
  {
    providedIn: 'root',
    factory: () => new UnsubscribeService(),
  }
);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  _router = inject(Router);
  _spinner = inject(NgxSpinnerService);
  _unsubscribe = inject(CUSTOM_UNSUBSCRIBE_TOKEN);
  _sharedService = inject(SharedService);
  appRef = inject(ApplicationRef);
  cdr = inject(ChangeDetectorRef);

  // ★ ضفناهم
  private _authService = inject(AuthService);
  private _permissionService = inject(PermissionService);
  private _apiService = inject(ApiService); // ★ لازم تعمل inject لـ ApiService

  ngOnInit(): void {
    this.checkRoutes();
    this.hydratePermissionsIfNeeded();
  }

  checkRoutes() {
    this._router.events
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((event: any) => {
        if (event instanceof RouteConfigLoadStart) {
          this._spinner.show();
        } else if (event instanceof RouteConfigLoadEnd) {
          this._spinner.hide();
        }
      });
  }

  /**
   * ★ لو اليوزر عمل refresh للصفحة وعنده توكن بس الصلاحيات مش متحمّلة،
   * بنستدعي /me تاني عشان نرجّع الصلاحيات.
   */
  private hydratePermissionsIfNeeded(): void {
    const token = this._authService.getAccessToken();
    if (!token) return;

    const alreadyLoaded = this._permissionService.getUserPermissions().length > 0;
    if (alreadyLoaded) return;

    this._apiService.get<any>(Auth_API.auth.me).subscribe({
      next: (res: any) => {
        const ok = res?.isSuccess === true || res?.success === true;
        const me = res?.result ?? res?.data;

        if (!ok || !me) {
          console.warn('⚠️ /me returned no valid data — clearing session');
          this._authService.logout();
          return;
        }

        this._authService.setUser(me);
        this._permissionService.loadFromMe(me);
      },
      error: (err) => {
        console.error('❌ Failed to hydrate permissions from /me', err);
        // لو التوكن expired أو مش valid، نعمل logout
        if (err?.status === 401 || err?.status === 403) {
          this._authService.logout();
        }
      },
    });
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}