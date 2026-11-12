import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { MatterTaskDto } from 'src/app/pages/matters/interfaces/matter-task.interface';
import { TmTaskTabEditorComponent } from './components/tm-task-tab-editor/tm-task-tab-editor.component';
import { matterTask_statusConfig } from './tm-task-tab-status.config';
import { SharedStatusComponent } from 'src/app/@shared/components/shared-status/shared-status.component';
import { matterTask_priorityConfig } from './tm-task-tab-priority.config';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { TmSessionFilterEditorComponent } from '../../components/tm-session-filter-editor/tm-session-filter-editor.component';
import { CalenderFilterChipsComponent } from '../../calendar/components/calender-filter-chips/calender-filter-chips.component';
import { SharedEmptySectionComponent } from '../../../../@shared/components/shared-empty-section/shared-empty-section.component';
import { EmptyConfig } from 'src/app/@shared/components/shared-empty-section/interface/empty-config.interface';
import { Matter_My_Task_Columns } from './tm-my-tasks-columns.config';
import { Matter_Assignee_Tasks_Columns } from './tm-assignee-tasks-columns.config';
import { TasksRefreshService } from 'src/app/@core/services/tasks-refresh.service';
import { SharedSkeletonComponent } from 'src/app/@shared/components/shared-skeleton/shared-skeleton.component';
import { finalize } from 'rxjs';

interface StatusMenuItem extends MenuItem {
  value: any;
}
@Component({
  selector: 'app-tm-tasks-tab',
  standalone: true,
  imports: [
    SharedTableComponent,
    SharedModule,
    MenuModule,
    SharedStatusComponent,
    RadioButtonModule,
    FormsModule,
    TmSessionFilterEditorComponent,
    CalenderFilterChipsComponent,
    SharedEmptySectionComponent,
    SharedSkeletonComponent,
  ],
  templateUrl: './tm-tasks-tab.component.html',
  styleUrl: './tm-tasks-tab.component.scss',
})
export class TmTasksTabComponent implements OnInit, OnDestroy {
  _apiService = inject(ApiService);
  _unsubscribe = inject(UnsubscribeService);
  _dialogService = inject(DialogService);
  _languageService = inject(LanguageService);
  refreshService = inject(TasksRefreshService);
  _toastrNotifiService = inject(ToastrNotifiService);

  _route = inject(ActivatedRoute);
  _router = inject(Router);
  data: MatterTaskDto[] = [];
  statusItems: StatusMenuItem[] = [];
  columns: any[] = [];
  statusConfig = matterTask_statusConfig;
  priorityConfig = matterTask_priorityConfig;
  pagination: any = {
    pagSize: PAGESIZE,
    pageNum: 1,
    orderByDirection: 'DSC',
    orderBy: 'startDate',
  };
  isLoading = false;
  first!: number;
  deleteDialogRef!: DynamicDialogRef;
  @Input() set id(value: number) {
    this.matterIdentifier = value;
  }
  matterIdentifier: any;
  isSorting = false;
  filter: any;
  emptyConfig: EmptyConfig = {
    messageTitle: this._languageService.getTransValue('common.nodataavailable'),
    addPermission: '',
  };
  ngOnInit(): void {
    this.columns = this._router.url.includes('my-tasks')
      ? Matter_My_Task_Columns
      : Matter_Assignee_Tasks_Columns;

    this.getTask();
    this.getStatusMenu();

    this.refreshService.refresh$.subscribe(() => {
      this.pagination.pageNum = 1;
      this.first = 0;

      this.getTask();
    });
  }
  openTaskEditor(rowData?: MatterTaskDto, mode?: string) {
    const ref = this._dialogService.open(TmTaskTabEditorComponent, {
      header: mode ? (mode === 'view' ? 'View Task' : 'Edit Task') : 'Add Task',
      data: { rowData, matterIdentifier: this.matterIdentifier, mode },
      width: '720px',
    });
    ref.onClose.subscribe({
      next: (res: any) => {
        if (res) this.getTask();
      },
    });
  }

  onPageChange(e: any) {
    this.pagination.pagSize = Number(e.rows);
    this.pagination.pageNum = e.first / e.rows + 1;
    this.first = e?.first;
    this.getTask();
  }

  onSort(e: any) {
    if (this.isSorting) return;

    this.isSorting = true;

    if (!e?.field) return;

    if (this.pagination.orderBy !== e.field) {
      this.pagination.orderByDirection = 'ASC';
    } else {
      this.pagination.orderByDirection =
        this.pagination.orderByDirection === 'ASC' ? 'DESC' : 'ASC';
    }

    this.pagination.orderBy = e.field;
    this.pagination.pageNum = 1;
    this.first = 0;

    this.getTask();
  }

  onFilter(e: any) {
    console.log('Filter triggered with:', e);

    this.filter = { ...e };

    if (!e.FromDate) delete e.ToDate;
    if (!e.ToDate) delete e.FromDate;

    this.pagination = {
      ...this.pagination,
      StatusId: e.StatusId?.value ?? null,
      AvailabilityId: e.AvailabilityId?.value ?? null,
      FromDate: e.FromDate ?? null,
      ToDate: e.ToDate ?? null,
      priorityId: e.priorityId?.value ?? null,
      UserId: e.UserId?.value ?? null,
      search: e.search ?? null,
    };

    console.log('Calling getData with pagination:', this.pagination);
    this.getTask();
  }

  onDelete(rowData: MatterTaskDto) {
    this.deleteDialogRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        modal: true,
        styleClass: 'w-[400px]',
        // width: '30vw',
        data: {
          type: ConfirmDialogType.Danger,
          title: this._languageService.getTransValue(
            'matters.deleteTaskTitle',
            { value: rowData?.id },
          ),
          message: this._languageService.getTransValue(
            'matters.deleteTaskMessage',
          ),
          btns: [
            {
              label: 'Discard',
              styleClass: 'border border-grey500 text-grey500',
              command: () => {
                this.deleteDialogRef.close();
              },
            },
            {
              label: 'Delete',
              styleClass: 'bg-textErrorBase text-white',
              command: () => {
                this.deleteTask(rowData.id);
              },
            },
          ],
        },
      },
    );
  }

  getTask() {
    this.isLoading = true;
    const requestParams = {
      pageNumber: this.pagination.pageNum,
      pageSize: this.pagination.pagSize,
      sortBy: this.pagination.orderBy,
      isDescending: this.pagination.orderByDirection === 'DESC',
      'filters[view]': this._router.url.includes('assignee')
        ? 'createdByMe'
        : 'mine',
    };

    this._apiService
      .get(API_Config.matterTask.get, requestParams)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          const body = res?.data ?? res?.result;

          if (isSuccess && body) {
            this.data = (body.items || []).map((item: any) => ({
              ...item,
              mtrNo: item.matterCode,
              description: item.title,
              periority: item.priorityId,
              periorityName: item.priorityName,
              status: item.matterTaskStatusId,
              statusName: item.matterTaskStatusName,
              createdBy: item.createdByName,
              assigneeInitial: item.assignees?.map((a: any) => a.initial) || [],
              assigneeName: item.assignees?.map((a: any) => a.name) || [],
              haveAttachment: item.attachmentCount > 0,
            }));

            this.pagination.totalElements = body.totalCount || 0;
            this.pagination = { ...this.pagination };
          }
          this.isLoading = false;
          this.isSorting = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  getStatusMenu() {
    this._apiService
      .get(API_Config.matterTask.lookups, { types: 'matterTaskStatuses' })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          const data = res?.data ?? res?.result;
          if (isSuccess && data) {
            const statuses = data.matterTaskStatuses || [];
            this.statusItems = statuses.map((s: any) => ({
              label: s.nameEn,
              value: s.id,
            }));
          }
        },
      });
  }

  updateStatus(newStatusId: number, rowData: any) {
    const originalStatus = rowData.matterTaskStatusId;
    const originalStatusName = rowData.matterTaskStatusName;

    rowData.matterTaskStatusId = newStatusId;
    const statusItem = this.statusItems.find(
      (item) => item.value === newStatusId,
    );
    rowData.matterTaskStatusName = statusItem
      ? statusItem.label
      : originalStatusName;

    const url = API_Config.matterTask.changeStatus.includes('{id}')
      ? API_Config.matterTask.changeStatus.replace('{id}', String(rowData.id))
      : `${API_Config.matterTask.changeStatus}/${rowData.id}/status`;

    const payload = {
      matterTaskStatusId: Number(newStatusId),
      percentComplete: rowData.percentComplete || 0,
    };

    this._apiService
      .patch(url, payload)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          if (!isSuccess) {
            rowData.matterTaskStatusId = originalStatus;
            rowData.matterTaskStatusName = originalStatusName;
          }
          this.getTask();
        },
        error: () => {
          rowData.matterTaskStatusId = originalStatus;
          rowData.matterTaskStatusName = originalStatusName;
        },
      });
  }

  deleteTask(TaskId: number) {
    const url = API_Config.matterTask.delete.replace('{id}', String(TaskId));
    this._apiService
      .delete(url)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          if (isSuccess) {
            if (this.data.length === 1) this.pagination.pageNum--;
            this.getTask();
            this.deleteDialogRef.close();
            this._toastrNotifiService.displaySuccess(res.message || 'Deleted');
          }
        },
      });
  }

  openTaskGroupEditor() {
    this._router.navigate([this.matterIdentifier], { relativeTo: this._route });
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
