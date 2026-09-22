import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiClientService } from '../api/api-client.service';
import { NotificationDto } from '../models/notifications/notification.model';

const SEEN_KEY = 'notif_seen';
const REFRESH_MS = 20_000;

/**
 * Header bell feed. The API computes the items live; "read" state is per
 * browser (localStorage) keyed by the stable notification id.
 */
@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly api = inject(ApiClientService);
  private readonly seen = signal<Set<string>>(this.loadSeen());
  private timer: ReturnType<typeof setInterval> | null = null;

  readonly items = signal<NotificationDto[]>([]);
  readonly loading = signal(false);
  readonly unread = computed(() => this.items().filter(n => !this.seen().has(n.id)));
  readonly unreadCount = computed(() => this.unread().length);

  /** Start polling; safe to call more than once. */
  start(): void {
    if (this.timer) return;
    this.refresh();
    this.timer = setInterval(() => this.refresh(), REFRESH_MS);
  }

  stop(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.items.set([]);
  }

  refresh(): void {
    this.loading.set(true);
    this.api.get<NotificationDto[]>('/notifications').subscribe({
      next: (list) => { this.items.set(list ?? []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  isRead(id: string): boolean { return this.seen().has(id); }

  markRead(id: string): void {
    const next = new Set(this.seen()); next.add(id);
    this.seen.set(next); this.saveSeen(next);
  }

  markAllRead(): void {
    const next = new Set(this.seen());
    for (const n of this.items()) next.add(n.id);
    this.seen.set(next); this.saveSeen(next);
  }

  private loadSeen(): Set<string> {
    try { return new Set<string>(JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]')); } catch { return new Set(); }
  }

  private saveSeen(set: Set<string>): void {
    // keep the list bounded; old ids stop mattering once the condition clears
    try { localStorage.setItem(SEEN_KEY, JSON.stringify([...set].slice(-500))); } catch { /* storage blocked */ }
  }
}
