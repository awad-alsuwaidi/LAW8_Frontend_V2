// import { Component, inject, OnDestroy, OnInit } from '@angular/core';
// import { API_Config } from 'src/app/@core/api/api-config/api.config';
// import { ApiService } from 'src/app/@core/api/api.service';
// import { ApiRes } from 'src/app/@core/models/apiRes-model';
// import { PAGESIZE } from 'src/app/@core/utilities/defines';
// import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
// import { SharedSearchComponent } from 'src/app/@shared/components/shared-search/shared-search.component';
// import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
// import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
// import { SharedModule } from 'src/app/@shared/shared.module';
// import { Notifications_Columns } from './notifications-columns.config';
// import { Router } from '@angular/router';
// import { data } from './notifications.fake';
// import { DialogService } from 'primeng/dynamicdialog';
// import { NotificationFilterEditorComponent } from './components/notification-filter-editor/notification-filter-editor.component';

// @Component({
//   selector: 'app-notifications',
//   standalone: true,
//   imports: [
//     SharedButtonComponent,
//     SharedTableComponent,
//     SharedModule,
//     SharedSearchComponent,
//   ],
//   templateUrl: './notifications.component.html',
//   styleUrl: './notifications.component.scss',
// })
// export class NotificationsComponent implements OnInit, OnDestroy {
//   protected _router = inject(Router);
//   private _apiService = inject(ApiService);
//   private _unsubscribe = inject(UnsubscribeService);
//   private _dialogService = inject(DialogService);
//   protected pagination: any = {
//     pagSize: PAGESIZE,
//     pageNum: 1,
//     orderByDirection: 'ASC',
//   };
//   data: any[] = [];
//   columns = Notifications_Columns;
//   selectedRows: any;
//   ngOnInit(): void {
//     this.getData();
//   }
//   markAllRead() {}
//   openFilterEditor() {
//     const ref = this._dialogService.open(NotificationFilterEditorComponent, {
//       header: 'Filter',
//       width: '40vw',
//     });
//     ref.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
//       next: (res) => {
//         if (res) {
//           console.log('filter', res);
//         }
//       },
//     });
//   }
//   toggleRead(rowData: any) {
//     const payload = {
//       id: rowData.id,
//       seen: !rowData.seen,
//     };
//   }
//   searchValueChange(value: string): void {
//     this.pagination.search = value;
//     this.pagination.pageNum = 1;
//     this.getData();
//   }

//   onPageChange(e: any) {
//     this.pagination.pagSize = Number(e.rows);
//     this.pagination.pageNum = e.first / e.rows + 1;
//     this.getData();
//   }

//   getData(): void {
//     this.data = data;
//     this.selectedRows = this.data.filter((obj) => !obj.seen);
//   }
//   ngOnDestroy(): void {
//     this._unsubscribe.destroy();
//   }
// }















import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedSearchComponent } from 'src/app/@shared/components/shared-search/shared-search.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { Notifications_Columns } from './notifications-columns.config';
import { NotificationFilterEditorComponent } from './components/notification-filter-editor/notification-filter-editor.component';
import { NotificationStatus } from './notification-status.enum';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';

interface NotificationDto {
  id: number;
  law_MatterId: number | null; 
  lable: string;
  module: string;
  message: string;
  activity: string;     
  actionDate: string;
  statusId: NotificationStatus;
  byUser?: string;
  type?: string;
  hasAccess?: boolean;
  isDeleted?: boolean;
  stageId?: number;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    SharedButtonComponent,
    SharedTableComponent,
    SharedModule,
    SharedSearchComponent,
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  providers: [MessageService],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  readonly notificationStatus = NotificationStatus;

  protected _router = inject(Router);
  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _dialogService = inject(DialogService);
  private _messageService = inject(MessageService);
  _toastrNotifiService = inject(ToastrNotifiService);
  _languageService = inject(LanguageService);

  loading = false;

  filterModel: any = {};
first = 0; 
  protected pagination: any = {
    pagSize: PAGESIZE,
    pageNum: 1,
    orderBy: 'actionDate',
    orderByDirection: 'DESC',
    search: null,
    totalElements: 0,
  };

  data: NotificationDto[] = [];
  columns = Notifications_Columns;
  selectedRows: NotificationDto[] = [];

  readCount = 0;
  unreadCount = 0;

  ngOnInit(): void {
    this.getData();
  }

markAllRead() {
  this._apiService
    .get(API_Config.notification.remarkAll)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res: any) => {

        if (res?.unreadCount != null && res?.readCount != null) {
          this.unreadCount = res.unreadCount;
          this.readCount = res.readCount;
        } else {
          this.readCount = this.pagination.totalElements;
          this.unreadCount = 0;
        }

        this.data.forEach(x => x.statusId = NotificationStatus.Read);
        this.selectedRows = [];
        this._toastrNotifiService.displaySuccess(
  this._languageService.getTransValue('topBar.markAllAsReadmessage')
);
      },
    });
}

toggleRead(rowData: NotificationDto) {
  const nextStatus =
    rowData.statusId === NotificationStatus.Read
      ? NotificationStatus.NotifiedUnread
      : NotificationStatus.Read;

  this.changeNotificationStatus(rowData.id, nextStatus)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res: any) => {

        rowData.statusId = nextStatus;

        if (res?.unreadCount != null && res?.readCount != null) {
          this.unreadCount = res.unreadCount;
          this.readCount = res.readCount;
        } else {
          if (nextStatus === NotificationStatus.Read) {
            this.readCount++;
            this.unreadCount--;
          } else {
            this.readCount--;
            this.unreadCount++;
          }
        }

        this.selectedRows = this.data.filter(
          (x) => x.statusId !== NotificationStatus.Read
        );
      },
    });
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

  openFilterEditor() {
    const ref = this._dialogService.open(NotificationFilterEditorComponent, {
      header: 'Filter',
      width: '40vw',
      data: {
        formlyModel: this.filterModel,
      },
    });

    ref.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
      next: (res) => {
        if (res) {
          this.filterModel = res;
          this.pagination.pageNum = 1;
          this.getData();
        }
      },
    });
  }

  
viewNotification(rowData: NotificationDto) {

  if (rowData.stageId === 3) {
    const ref = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        modal: true,
        styleClass: 'w-[500px]',
        data: {
          type: ConfirmDialogType.Danger,
          title: 'Deleted Record',
          // message: rowData.message || 'No message available',
          message: 'No action can be done',
          btns: [
            {
              label: 'Close',
              styleClass: 'border border-grey500 text-grey500',
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

  if (rowData.hasAccess === false) {
    this._messageService.add({
      severity: 'error',
      summary: 'Access Denied',
      detail: `Access Denied. You don't have access to this resource.`,
    });
    return;
  }

  if (rowData.isDeleted) {
    this._messageService.add({
      severity: 'warn',
      summary: 'Deleted Record',
      detail: 'Deleted Record. No action can be done.',
    });
    return;
  }

  this.navigateToModule(rowData);
}
  searchValueChange(value: string): void {
    this.pagination.search = value || null;
    this.pagination.pageNum = 1;
    this.getData();
  }

onPageChange(e: any) {
  this.pagination.pagSize = e.rows;
  this.pagination.pageNum = (e.first / e.rows) + 1;
  this.first = e.first;

  this.getData();
}

onSortChange(event: any) {
  const map: any = {
    actionDate: 'actionDate',  
    byUserName: 'byUser',  
    lable: 'type'
  };

  const newOrderBy = map[event.field] || event.field;
  const newDirection = event.order === 1 ? 'ASC' : 'DESC';

  this.pagination.orderBy = newOrderBy;
  this.pagination.orderByDirection = newDirection;

  this.getData();
}

getData(): void {
  this.loading = true;
  const query = this.buildFilterQuery();
  this._apiService
    .get(`${API_Config.notification.getAllByFilter}?${query}`)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
     next: (res: any) => {
  const page = res?.result ?? {};
  const rawList = (page?.dataList ?? []) as any[];
  if (res?.unreadCount != null && res?.readCount != null) {
    this.unreadCount = res.unreadCount;
    this.readCount = res.readCount;
  }

  this.data = rawList.map((n: any) => ({
    id: n.id,
    lable: n.type,
    activity: n.message,
    actionDate: n.date,
    type: n.type,
    module: n.type,
    message: n.message,
    byUser: n.byUser,
    statusId: n.statusId,
    law_MatterId: Number(n.requestId) || null,
    stageId: n.stageId,
  }));

  this.pagination = {
    ...this.pagination,
    totalElements: page?.totalCount ?? 0
  };

  this.selectedRows = this.data.filter(
    (x) => x.statusId !== NotificationStatus.Read
  );

  this.loading = false;
},
      error: (err: any) => {
        console.error('Get notifications error:', err);
        this.data = [];
        this.selectedRows = [];
        this.pagination.totalElements = 0;
        this.unreadCount = 0;
        this.readCount = 0;
        this.loading = false;
      },
    });
}

getNotificationIcon(type: string): string {
  const key = (type || '').toLowerCase();

  if (key.includes('matter')) return 'Matters';
  if (key.includes('task')) return 'Task';
  if (key.includes('hearing')) return 'Activity';
  if (key.includes('meeting')) return 'Activity';
  if (key.includes('note')) return 'Activity';
  if (key.includes('report')) return 'Activity';
  if (key.includes('judgement')) return 'Activity';
  if (key.includes('expert')) return 'Activity';

  return 'Matters';
}


private getSelectedStatusIds(): number[] {
  switch (this.filterModel.status) {
    case 'READ':
      return [NotificationStatus.Read];

    case 'UNREAD':
      return [
        NotificationStatus.Unnotified,
        NotificationStatus.NotifiedUnread,
      ];

    case 'ALL':
    default:
      return [
        NotificationStatus.Unnotified,
        NotificationStatus.NotifiedUnread,
        NotificationStatus.Read,
      ];
  }
}

private toDateOnly(date: any): string {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

private buildFilterQuery(): string {
  const params = new URLSearchParams();

  params.set('pageNum', String(this.pagination.pageNum));
  params.set('pagSize', String(this.pagination.pagSize));
  params.set('orderBy', this.pagination.orderBy || 'actionDate');
  params.set('orderByDirection', this.pagination.orderByDirection || 'DESC');

  const statusIds = this.getSelectedStatusIds();
  statusIds.forEach((id) => params.append('StatusIds', String(id)));

  const selectedModules = this.filterModel.module ?? [];
  selectedModules.forEach((moduleId: any) => {
    params.append('ModuleIds', String(moduleId?.value ?? moduleId?.id ?? moduleId));
  });

  const selectedUsers = this.filterModel.ByUsers ?? [];
  selectedUsers.forEach((user: any) => {
    params.append('ByUsers', String(user?.value ?? user?.id ?? user));
  });

  // if (this.filterModel.dateFrom) {
  //   params.set('FromDate', new Date(this.filterModel.dateFrom).toISOString());
  // }

  // if (this.filterModel.dateTo) {
  //   params.set('ToDate', new Date(this.filterModel.dateTo).toISOString());
  // }
if (this.filterModel.dateFrom) {
  params.set(
    'FromDate',
    this.toDateOnly(this.filterModel.dateFrom)
  );
}

if (this.filterModel.dateTo) {
  params.set(
    'ToDate',
    this.toDateOnly(this.filterModel.dateTo)
  );
}
  return params.toString();
}



  private changeNotificationStatus(id: number, statusId: NotificationStatus) {
    return this._apiService.post(
      `${API_Config.notification.changeStatus}?Id=${id}&StatusId=${statusId}`,
      {}
    );
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

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}