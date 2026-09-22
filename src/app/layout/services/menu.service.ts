import { Injectable, signal, computed } from '@angular/core';

/** Breakpoint below which the sidebar becomes an off-canvas drawer. */
export const MOBILE_BREAKPOINT = 768;

export function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
}

@Injectable({ providedIn: 'root' })
export class MenuService {
  /** Desktop: expanded (260px) vs collapsed (icon rail). */
  private readonly _expanded = signal(true);
  /** Mobile: whether the off-canvas drawer is open. */
  private readonly _mobileOpen = signal(false);

  readonly expanded = computed(() => this._expanded());
  readonly mobileOpen = computed(() => this._mobileOpen());

  toggle(): void {
    this._expanded.update((v) => !v);
  }

  collapse(): void {
    this._expanded.set(false);
  }

  expand(): void {
    this._expanded.set(true);
  }

  openMobile(): void {
    this._mobileOpen.set(true);
  }

  closeMobile(): void {
    this._mobileOpen.set(false);
  }

  toggleMobile(): void {
    this._mobileOpen.update((v) => !v);
  }
}
