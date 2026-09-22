import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/auth/services/auth.service';
import { MenuService } from '../../services/menu.service';
import { TranslationService } from '../../../features/auth/services/Translation.service';
import { NotificationsService } from '../../../core/notifications/notifications.service';
import { NotificationDto } from '../../../core/models/notifications/notification.model';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly menuService = inject(MenuService);
  private readonly translationService = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly user = toSignal(this.auth.currentUser$, { initialValue: null });

  get displayName(): string {
    const u = this.user();
    if (!u) return '';
    const ar = (u.nameAr ?? '').trim(), en = (u.nameEn ?? '').trim();
    return this.isAr ? (ar || en || u.email) : (en || ar || u.email);
  }

  get initials(): string {
    const n = this.displayName;
    return n ? n.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') : '';
  }

  get primaryRole(): string {
    return this.user()?.roles?.[0] ?? '';
  }

  openSettings(): void {
    this.profileOpen.set(false);
    this.router.navigate(['/self-service']);
  }

  readonly isExpanded = this.menuService.expanded;
  readonly profileOpen = signal(false);
  readonly notifOpen = signal(false);


  readonly notifSvc = inject(NotificationsService);

  get unreadCount(): number { return this.notifSvc.unreadCount(); }
  get notifications(): NotificationDto[] { return this.notifSvc.items(); }

  constructor() {
    this.notifSvc.start();
  }

  notifTitle(n: NotificationDto): string {
    const product = (this.isAr && n.productNameAr) || n.productName || '';
    const org = n.organizationName ?? '';
    return this.translationService.translate('notifications.' + n.kind + '.title')
      .replace('{{org}}', org).replace('{{product}}', product);
  }

  notifBody(n: NotificationDto): string {
    const days = Math.abs(n.daysLeft ?? 0);
    const key = 'notifications.' + n.kind + '.body';
    const text = this.translationService.translate(key);
    if (text === key) return n.detail ?? '';
    return text.replace('{{days}}', String(days)).replace('{{detail}}', n.detail ?? '');
  }

  notifTime(n: NotificationDto): string {
    const diff = Date.now() - new Date(n.occurredAtUtc).getTime();
    const mins = Math.floor(diff / 60_000), hours = Math.floor(diff / 3_600_000), days = Math.floor(diff / 86_400_000);
    if (days > 0)  return this.translationService.translate('dashboard.feed.daysAgo').replace('{{n}}', String(days));
    if (hours > 0) return this.translationService.translate('dashboard.feed.hoursAgo').replace('{{n}}', String(hours));
    if (mins > 0)  return this.translationService.translate('dashboard.feed.minsAgo').replace('{{n}}', String(mins));
    return this.translationService.translate('dashboard.feed.justNow');
  }

  openNotification(n: NotificationDto): void {
    this.notifSvc.markRead(n.id);
    this.notifOpen.set(false);
    this.router.navigateByUrl(n.route);
  }

  get currentLang(): string {
    return this.translationService.getCurrentLanguage().toUpperCase();
  }

  get isAr(): boolean {
    return this.translationService.getCurrentLanguage() === 'ar';
  }

  /** Hamburger is only rendered on mobile - it drives the off-canvas drawer. */
  toggle(): void {
    this.menuService.toggleMobile();
  }

  toggleLanguage(): void {
    const next = this.translationService.getCurrentLanguage() === 'en' ? 'ar' : 'en';
    this.translationService.setLanguage(next);
  }

  toggleNotif(event: MouseEvent): void {
    event.stopPropagation();
    this.notifOpen.update(v => !v);
    this.profileOpen.set(false);
  }

  markAllRead(): void {
    this.notifSvc.markAllRead();
  }

  toggleProfile(event: MouseEvent): void {
    event.stopPropagation();
    this.profileOpen.update(v => !v);
    this.notifOpen.set(false);
  }

  logout(): void {
    this.profileOpen.set(false);
    this.notifSvc.stop();
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.profileOpen.set(false);
    this.notifOpen.set(false);
  }
}
