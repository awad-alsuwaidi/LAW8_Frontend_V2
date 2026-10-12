// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class DashboardModeService {
//   private _mode$ = new BehaviorSubject<1 | 2 | 3>(1);

//   mode$ = this._mode$.asObservable();

//   setMode(mode: 1 | 2 | 3) {
//     this._mode$.next(mode);
//   }
// }



// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';
// import { AuthService } from 'src/app/@core/services';

// export type DashboardMode = 1 | 2 | 3;

// @Injectable({ providedIn: 'root' })
// export class DashboardModeService {
//   private _mode$ = new BehaviorSubject<DashboardMode>(1);
//   mode$ = this._mode$.asObservable();

//   constructor(private auth: AuthService) {
//     const mode = this.getModeFromToken();
//     this._mode$.next(mode);
//   }

//   private getModeFromToken(): DashboardMode {
//     try {
//       const token = this.auth.getToken();
//       if (!token) return 1;

//       const payload = JSON.parse(atob(token.split('.')[1]));
//       const mode = Number(payload?.DashBoardTempletId ?? 1);

//       return mode === 1 || mode === 2 || mode === 3 ? mode : 1;
//     } catch {
//       return 1;
//     }
//   }

//   setMode(mode: DashboardMode) {
//     this._mode$.next(mode);
//   }
// }



import { Injectable, effect } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/@core/services';

export type DashboardMode = 1 | 2 | 3;

@Injectable({ providedIn: 'root' })
export class DashboardModeService {
  private _mode$ = new BehaviorSubject<DashboardMode>(1);
  readonly mode$ = this._mode$.asObservable();

  constructor(private auth: AuthService) {
    this._mode$.next(this.modeFromToken());

    effect(() => {
      const profile: any = this.auth.getUserProfile?.();
      if (!profile) return;

      const m = this.normalizeMode(profile);
      if (m !== this._mode$.value) this._mode$.next(m);
    });
  }

  private normalizeMode(obj: any): DashboardMode {
    const raw =
      obj?.dashBoardTempletId ??
      obj?.DashBoardTempletId ??
      obj?.dashboardTempletId ??
      obj?.dashboardMode ??
      obj?.DashboardMode ??
      1;

    const n = Number(raw);
    return n === 1 || n === 2 || n === 3 ? n : 1;
  }

  private modeFromToken(): DashboardMode {
    try {
      const token = this.auth.getToken();
      if (!token) return 1;

      const payload = JSON.parse(atob(token.split('.')[1]));
      return this.normalizeMode(payload);
    } catch {
      return 1;
    }
  }

  getCurrentMode(): DashboardMode {
    return this._mode$.value;
  }

  setMode(mode: DashboardMode) {
    this._mode$.next(mode);
  }
}
