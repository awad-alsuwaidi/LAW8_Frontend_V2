import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChangeDetectorRef, Component, inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/@shared/shared.module';
import * as signalR from '@microsoft/signalr';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { IHttpConnectionOptions } from '@microsoft/signalr';
import { ApiService } from 'src/app/@core/api/api.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { LanguageService, StorageService, ToastrNotifiService } from 'src/app/@core/services';
import { NotificationDto } from './interface/notification.interface';
import { ClickOutsideDirective } from 'src/app/@shared/directives/click-outside.directive';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { NotificationStatus } from 'src/app/pages/notifications/notification-status.enum';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { ToastModule } from 'primeng/toast';


@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [SharedModule, ClickOutsideDirective, ToastModule],
  templateUrl: './app-notification.component.html',
  styleUrl: './app-notification.component.scss',
  providers: [MessageService],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          opacity: 1,
          transform: 'translateY(0)',
          visibility: 'visible',
        }),
      ),
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'translateY(-20px)',
          visibility: 'hidden',
        }),
      ),
      transition('open => closed', [animate('0.2s')]),
      transition('closed => open', [animate('0.2s')]),
    ]),
  ],
})
export class AppNotificationComponent implements OnInit, OnDestroy {
  readonly notificationStatus = NotificationStatus;
  readonly MAX_MINIMIZED_ITEMS = 20;

  isOpen = false;

  _apiService = inject(ApiService);
  _unsubscribe = inject(UnsubscribeService);
  _storageService = inject(StorageService);
  _router = inject(Router);
  _messageService = inject(MessageService);
  allNotifications: NotificationDto[] = [];
  notifications: NotificationDto[] = [];
  notificationCount = 0;
private _ngZone = inject(NgZone);
private _cdr = inject(ChangeDetectorRef);
private isLoadingNotifications = false;
  private justConvertedIds: number[] = [];
  private hubConnection!: signalR.HubConnection;
  private _toastrNotifiService = inject(ToastrNotifiService);
  private _languageService = inject(LanguageService);
_dialogService = inject(DialogService);

ngOnInit(): void {
  this.startConnection();
}

  toggleMenu(): void {
    if (this.isOpen) {
      this.closeMenu();
      return;
    }

    this.openMenu();
  }

  closeMenu(): void {
    this.isOpen = false;
    this.notifications = [];
    this.justConvertedIds = [];
  }

private loadNotifications(afterLoad?: () => void): void {
  if (this.isLoadingNotifications) return;

  this.isLoadingNotifications = true;

  this._apiService
    .get(API_Config.notification.get)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res: any) => {
        if (res?.isSuccess) {
          const raw = (res.result ?? []) as any[];

          this.allNotifications = raw
            .map((item) => this.mapNotification(item))
            .sort(
              (a, b) =>
                new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime()
            );

          afterLoad?.();
        } else {
          this._toastrNotifiService.displayError(
            'Failed to load notifications'
          );

          this.allNotifications = [];
          this.notifications = [];
        }
      },
      error: () => {
        this._toastrNotifiService.displayError(
          'Something went wrong while loading notifications'
        );

        this.allNotifications = [];
        this.notifications = [];
        this.isLoadingNotifications = false;
      },
      complete: () => {
        this.isLoadingNotifications = false;
      },
    });
}

  private mapNotification(item: any): NotificationDto {
    return {
      ...item,
      type: item.type ?? item.module,
     statusId: item.statusId ?? NotificationStatus.Unnotified,
    };
  }

  
getNotificationIconPath(item: any): string {
  const folder =
    item.statusId === NotificationStatus.Read ? 'Read' : 'Unread';

  const type = (item.type || '').toLowerCase();

  let icon = 'matter';

  if (type.includes('matter')) icon = 'matter';
  else if (type.includes('task')) icon = 'task';
  else if (type.includes('hearing')) icon = 'hearing session';
  else if (type.includes('meeting')) icon = 'meeting';
  else if (type.includes('client')) icon = 'client';
  else if (type.includes('call')) icon = 'call';

  return `assets/images/icons/notification/${folder}/${icon}.svg`;
}
private refreshBadgeCount(): void {
  this.notificationCount = this.allNotifications.filter((x) =>
    this.isUnnotified(x)
  ).length;
}

  // private applyMinimizedDisplayRules(): void {
  //   const sorted = [...this.allNotifications].sort(
  //     (a, b) => new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime()
  //   );

  //   const source = this.justConvertedIds.length
  //     ? sorted.filter((x) => this.justConvertedIds.includes(x.id))
  //     : sorted;

  //   this.notifications = source.slice(0, this.MAX_MINIMIZED_ITEMS);
  // }

private applyMinimizedDisplayRules(): void {
  const sorted = [...this.allNotifications].sort(
    (a, b) =>
      new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime()
  );

  const source = this.justConvertedIds.length
    ? sorted.filter((x) => this.justConvertedIds.includes(x.id))
    : sorted;

  this.notifications = source.slice(0, this.MAX_MINIMIZED_ITEMS);
}

markAllAsRead(): void {
  const ids = this.allNotifications
    .filter((x) => this.isNotifiedUnread(x))
    .map((x) => x.id);

  if (!ids.length) return;

  forkJoin(
    ids.map((id) => this.changeNotificationStatus(id, NotificationStatus.Read))
  )
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: () => {
        this.allNotifications = this.allNotifications.map((item) =>
          ids.includes(item.id)
            ? { ...item, statusId: NotificationStatus.Read }
            : item
        );

        this.notifications = this.notifications.map((item) =>
          ids.includes(item.id)
            ? { ...item, statusId: NotificationStatus.Read }
            : item
        );

        this.justConvertedIds = [];
        this.refreshBadgeCount();
        this._cdr.markForCheck();

        this._toastrNotifiService.displaySuccess(
          this._languageService.getTransValue('topBar.markAllAsReadmessage')
        );
      },
    });
}


private openMenu(): void {
  this.loadNotifications(() => {
    const unnotifiedIds = this.allNotifications
      .filter((x) => this.isUnnotified(x))
      .map((x) => x.id);

    this.isOpen = true;
    this.notificationCount = 0;
    this._cdr.markForCheck();

    if (!unnotifiedIds.length) {
      this.justConvertedIds = [];
      this.applyMinimizedDisplayRules();
      this.refreshBadgeCount();
      this._cdr.markForCheck();
      return;
    }
    this.justConvertedIds = [...unnotifiedIds];

    this._apiService
      .get(API_Config.notification.remarkNotifiNotificationStatus)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess) {
            this.allNotifications = this.allNotifications.map((item) =>
              unnotifiedIds.includes(item.id)
                ? { ...item, statusId: NotificationStatus.NotifiedUnread }
                : item
            );
          }

          this.applyMinimizedDisplayRules();
          this.refreshBadgeCount();
          this._cdr.markForCheck();
        },
        error: () => {
          this.applyMinimizedDisplayRules();
          this.refreshBadgeCount();
          this._cdr.markForCheck();
        },
      });
  });
}

onNotificationClick(item: NotificationDto): void {
    if (item.stageId === 3) {
    const ref = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        modal: true,
        styleClass: 'w-[500px]',
        data: {
          type: ConfirmDialogType.Danger,
          title: 'Deleted Record',
          // message: item.message || 'No message available',
          message: 'No action can be done',
          btns: [
            {
              label: 'Close',
              styleClass: 'border border-grey500 text-grey500 w-100',
              command: () => {
                ref.close();
              },
            },  
               {
              label: '',
              styleClass: 'cursor-default',
           
            },
          ],
        },
      }
    );

    return;
  }
  if (item.hasAccess === false) {
    this.showAccessDenied();
    return;
  }

  if (item.isDeleted) {
    this.showDeletedRecord();
    return;
  }

  const go = () => {
    this.closeMenu();
    this.navigateToModule(item);
  };

  if (this.isRead(item)) {
    go();
    return;
  }

  this.changeNotificationStatus(item.id, NotificationStatus.Read)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: () => {
        this.allNotifications = this.allNotifications.map((x) =>
          x.id === item.id ? { ...x, statusId: NotificationStatus.Read } : x
        );

        this.notifications = this.notifications.map((x) =>
          x.id === item.id ? { ...x, statusId: NotificationStatus.Read } : x
        );

        this.justConvertedIds = this.justConvertedIds.filter((id) => id !== item.id);
        this.refreshBadgeCount();
        this._cdr.markForCheck();
        go();
      },
      error: () => go(),
    });
}

  goToAllNotifications(): void {
    this.closeMenu();
    this._router.navigate(['/notifications']);
  }

  private changeNotificationStatus(id: number, statusId: NotificationStatus) {
    return this._apiService.post(
      `${API_Config.notification.changeStatus}?Id=${id}&StatusId=${statusId}`,
      {}
    );
  }

  private isUnnotified(item: NotificationDto): boolean {
    return item.statusId === NotificationStatus.Unnotified;
  }

  private isNotifiedUnread(item: NotificationDto): boolean {
    return item.statusId === NotificationStatus.NotifiedUnread;
  }

  isRead(item: NotificationDto): boolean {
    return item.statusId === NotificationStatus.Read;
  }

  getNotificationBody(item: NotificationDto): string {
    if (item.message) {
      return this.truncateText(item.message, 120);
    }

    const matterNo = item.matterNo ?? '-';
    const activityCode = item.activityCode ?? '-';
    const dateTime = this.formatDate(item.actionDate);
    const priority = item.priority ?? '-';
    const description = this.truncateText(item.description ?? '', 40);

    return `Matter No: ${matterNo} | Activity Code: ${activityCode} | Date & Time: ${dateTime} | Priority: ${priority} | ${description}`;
  }

  private truncateText(value: string, limit = 120): string {
    if (!value) return '';
    return value.length > limit ? `${value.slice(0, limit).trim()}...` : value;
  }

  private formatDate(value: string): string {
    return new Date(value).toLocaleString();
  }

  private showAccessDenied(): void {
    this._messageService.add({
      severity: 'error',
      summary: 'Access Denied',
      detail: `Access Denied. You don't have access to this resource.`,
    });
  }

  private showDeletedRecord(): void {
    this._messageService.add({
      severity: 'warn',
      summary: 'Deleted Record',
      detail: 'Deleted Record. No action can be done.',
    });
  }

  navigateToModule(item: NotificationDto): void {
    const moduleName = (item.module || '').toLowerCase();

    if (moduleName.includes('task')) {
      this._router.navigate([`/matters/${item.law_MatterId}/tasks`]);
      return;
    }

    if (
      moduleName.includes('activity') ||
      moduleName.includes('hearing') ||
      moduleName.includes('meeting') ||
      moduleName.includes('note') ||
      moduleName.includes('report')
    ) {
      this._router.navigate([`/matters/${item.law_MatterId}/activities`]);
      return;
    }

    this._router.navigate(['/matters', item.law_MatterId]);
  }

async startConnection() {
  const token = this._storageService.getStorage('token');
  const options: IHttpConnectionOptions = {
    headers: {
      token: token,
    },
  };

  this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(API_Config.notification.signalhub, options)
    .build();

  this.addReceiveMessageListener();
  try {
    await this.hubConnection.start();
    this.loadNotificationCount();
  } catch (err) {
    console.log('Error while starting connection: ' + err);
  }
}

addReceiveMessageListener() {
  this.hubConnection.off('BroadCastNotificationCount');
  this.hubConnection.on('BroadCastNotificationCount', () => {
    this._ngZone.run(() => {
      if (this.isOpen) {
        this.loadNotifications(() => {
          this.applyMinimizedDisplayRules();
          this.refreshBadgeCount();
          this._cdr.markForCheck();
        });
        return;
      }

      this.loadNotificationCount(true);
      this._cdr.markForCheck();
    });
  });
}

// private loadNotificationCount(): void {
//   this._apiService
//     .get(API_Config.notification.getCount)
//     .pipe(this._unsubscribe.takeUntilDestroy())
//     .subscribe({
//       next: (res: any) => {
//         const count = Number(res?.count ?? res?.result ?? 0);

//         this._ngZone.run(() => {
//           this.notificationCount = count;
//           this._cdr.markForCheck();
//         });
//       },
//     });
// }

private loadNotificationCount(showToast = false): void {
  this._apiService
    .get(API_Config.notification.getCount)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res: any) => {
        const count = Number(res?.count ?? res?.result ?? 0);

        this._ngZone.run(() => {
          this.notificationCount = count;
          this._cdr.markForCheck();

          if (showToast && count > 0) {
            this._messageService.add({
              severity: 'info',
              summary: 'Notifications',
              detail: `Tahaaaaaaaa You have ${count} new notification(s)`,
              life: 3000,
            });
          }
        });
      },
    });
}

// addReceiveMessageListener() {
//   this.hubConnection.on('BroadCastNotificationCount', () => {
//         this.notificationCount++;
//         this.handleNewNotification();

//   });
// }

  stopConnection() {
    this.hubConnection?.stop();
  }

  ngOnDestroy(): void {
    this.stopConnection();
    this._unsubscribe.destroy();
  }
}