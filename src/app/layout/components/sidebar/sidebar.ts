import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MenuService, isMobileViewport } from '../../services/menu.service';
import { TranslationService } from '../../../features/auth/services/Translation.service';
import { Menu } from './menu';
import { SubMenuItem } from './menu.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  private readonly menuService = inject(MenuService);
  private readonly translationService = inject(TranslationService);
  private readonly router = inject(Router);

  readonly menu = Menu.pages;
  readonly isExpanded = this.menuService.expanded;
  readonly mobileOpen = this.menuService.mobileOpen;

  constructor() {
    // Any navigation closes the drawer on mobile.
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.menuService.closeMobile());
  }

  get isMobile(): boolean {
    return isMobileViewport();
  }

  closeMobile(): void {
    this.menuService.closeMobile();
  }

  expandedItems = new Set<string>();

  get isRtl(): boolean {
    return this.translationService.getCurrentLanguage() === 'ar';
  }

  label(item: SubMenuItem): string {
    return this.isRtl && item.labelAr ? item.labelAr : item.label;
  }

  ngOnInit(): void {
    this.handleResize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.handleResize();
  }

  private handleResize(): void {
    if (this.isMobile) {
      // The drawer always shows the full (expanded) menu; the icon rail is desktop-only.
      this.menuService.expand();
    } else {
      this.menuService.closeMobile();
    }
  }

  /** Collapse/expand on desktop; on mobile the same button just closes the drawer. */
  toggle(): void {
    if (this.isMobile) this.menuService.closeMobile();
    else this.menuService.toggle();
  }

  toggleItem(key: string): void {
    if (this.expandedItems.has(key)) {
      this.expandedItems.delete(key);
    } else {
      if (!this.isExpanded()) {
        this.menuService.expand();
      }
      this.expandedItems.add(key);
    }
  }

  isItemExpanded(key: string): boolean {
    return this.expandedItems.has(key);
  }
}
