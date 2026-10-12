import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService } from 'src/app/@core/services';
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

  getTask() {
    this.isLoading = true;

    const requestParams = {
      ...this.pagination,
      assignee: this._router.url.includes('assignee'),
    };

    this._apiService
      .get(API_Config.taskDashboard.get, requestParams)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.data = res.result.dataList || [];
            this.pagination = {
              ...this.pagination,
              totalElements: res.result.totalCount,
            };
          }
          this.isLoading = false;
          this.isSorting = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
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
  deleteTask(TaskId: number) {
    this._apiService
      .post(API_Config.matterTask.delete, {}, { id: TaskId })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.data.length == 1 ? this.pagination.pageNum-- : null;
            this.getTask();
            this.deleteDialogRef.close();
          }
        },
      });
  }
  getStatusMenu() {
    this._apiService
      .get(API_Config.general.getActivityStatus)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this.statusItems = getOptionsArray(res.result, 'id', 'name');
            console.log(this.statusItems);
          }
        },
      });
  }

  openTaskGroupEditor() {
    this._router.navigate([this.matterIdentifier], { relativeTo: this._route });
  }

  updateStatus(newStatusId: string, rowData: any) {
    const originalStatus = rowData.status;
    const originalStatusName = rowData.statusName;

    rowData.status = newStatusId;
    const statusItem = this.statusItems.find(
      (item) => (item as any).value === newStatusId,
    );
    rowData.statusName = statusItem ? statusItem.label : originalStatusName;
    this._apiService
      .post(
        API_Config.matterTask.changeStatus,
        {},
        {
          TaskId: rowData.id,
          newStatusId: newStatusId,
        },
      )
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
          } else {
            rowData.status = originalStatus;
            rowData.statusName = originalStatusName;
          }
        },
        error: (error) => {
          rowData.status = originalStatus;
          rowData.statusName = originalStatusName;
          //console.error('Error updating status:', error);
        },
      });
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
