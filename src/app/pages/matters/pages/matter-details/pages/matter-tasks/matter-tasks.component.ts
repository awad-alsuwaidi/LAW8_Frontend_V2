import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { MatterTaskDto } from 'src/app/pages/matters/interfaces/matter-task.interface';
import { MatterTaskEditorComponent } from './components/matter-task-editor/matter-task-editor.component';
import { Matter_Task_Columns } from './matter-task-columns.config';
import { matterTask_statusConfig } from './matter-task-status.config';
import { SharedStatusComponent } from 'src/app/@shared/components/shared-status/shared-status.component';
import { matterTask_priorityConfig } from './matter-task-priority.config';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { finalize } from 'rxjs';

interface StatusMenuItem extends MenuItem {
  value: any;
}

@Component({
  selector: 'app-matter-tasks',
  standalone: true,
  imports: [
    SharedButtonComponent,
    SharedTableComponent,
    SharedModule,
    MenuModule,
    SharedStatusComponent,
    RadioButtonModule,
    FormsModule,
  ],
  templateUrl: './matter-tasks.component.html',
  styleUrl: './matter-tasks.component.scss',
})
export class MatterTasksComponent implements OnInit, OnDestroy {
  _apiService = inject(ApiService);
  _unsubscribe = inject(UnsubscribeService);
  _dialogService = inject(DialogService);
  _languageService = inject(LanguageService);
  _route = inject(ActivatedRoute);
  _toastrNotifiService = inject(ToastrNotifiService);
  _router = inject(Router);

  data: MatterTaskDto[] = [];
  statusItems: StatusMenuItem[] = [];
  columns: any[] = Matter_Task_Columns;
  statusConfig = matterTask_statusConfig;
  priorityConfig = matterTask_priorityConfig;

  pagination: any = {
    PageSize: PAGESIZE,
    PageNumber: 1,
    SortBy: 'startDate',
    IsDescending: false,
    Filters: {},
    totalElements: 0,
  };

  first!: number;
  deleteDialogRef!: DynamicDialogRef;
  isLoading!: boolean;

  @Input() set id(value: number) {
    this.matterIdentifier = value;
  }
  matterIdentifier: any;

  ngOnInit(): void {
    this.getTask();
    this.getStatusMenu();
  }

  openTaskEditor(rowData?: MatterTaskDto, mode?: string) {
    const ref = this._dialogService.open(MatterTaskEditorComponent, {
      header: mode
        ? mode === 'view'
          ? this._languageService.getTransValue('matters.viewTask')
          : this._languageService.getTransValue('matters.editTask')
        : this._languageService.getTransValue('matters.addTask'),
      data: { rowData, matterIdentifier: this.matterIdentifier, mode },
      width: '720px',
    });
    ref.onClose.subscribe({
      next: (res: any) => {
        if (res) this.getTask();
      },
    });
  }

  onSort(e: any) {
    const field = e.field;
    if (!field) return;

    if (this.pagination.SortBy !== field) {
      this.pagination.SortBy = field;
      this.pagination.IsDescending = true;
    } else {
      this.pagination.IsDescending = !this.pagination.IsDescending;
    }

    this.pagination.PageNumber = 1;
    this.first = 0;
    this.getTask();
  }

  onPageChange(e: any) {
    this.pagination.PageSize = Number(e.rows);
    this.pagination.PageNumber = e.first / e.rows + 1;
    this.first = e?.first;
    this.getTask();
  }

  onDelete(rowData: MatterTaskDto) {
    this.deleteDialogRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        modal: true,
        styleClass: 'w-[400px]',
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
              command: () => this.deleteDialogRef.close(),
            },
            {
              label: 'Delete',
              styleClass: 'bg-textErrorBase text-white',
              command: () => this.deleteTask(rowData.id),
            },
          ],
        },
      },
    );
  }

  deleteTask(TaskId: number) {
    const url = API_Config.matterTask.delete.includes('{id}')
      ? API_Config.matterTask.delete.replace('{id}', String(TaskId))
      : `${API_Config.matterTask.delete}/${TaskId}`;

    this._apiService
      .delete(url)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          if (isSuccess) {
            this._toastrNotifiService.displaySuccess(
              res.message || 'Task deleted successfully',
            );
            if (this.data.length === 1) this.pagination.PageNumber--;
            this.getTask();
            this.deleteDialogRef.close();
          } else {
            this._toastrNotifiService.displayError(
              res?.message || 'Failed to delete task',
            );
          }
        },
        error: () => {
          this._toastrNotifiService.displayError(
            'Something went wrong while deleting task',
          );
        },
      });
  }

  getStatusMenu() {
    this._apiService
      .get(API_Config.general.getActivityStatus)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          const data =
            res?.data?.items ?? res?.result?.items ?? res?.result ?? res?.data;
          if (isSuccess && Array.isArray(data)) {
            this.statusItems = getOptionsArray(data, 'id', 'nameEn') || [];
          }
        },
      });
  }

  openTaskGroupEditor() {
    this._router.navigate([this.matterIdentifier], { relativeTo: this._route });
  }

  getTask() {
    this.pagination.Filters = {
      ...this.pagination.Filters,
      MatterId: this.matterIdentifier,
    };

    this.isLoading = true;

    this._apiService
      .get(API_Config.matterTask.get, this.pagination)
      .pipe(
        this._unsubscribe.takeUntilDestroy(),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          const result = res?.data ?? res?.result;

          if (isSuccess && result) {
            this.data = result.items || [];
            
            this.pagination.totalElements = result.totalCount;
            this.pagination = { ...this.pagination };
          }
        },
        error: (err) => {},
      });
  }
updateStatus(newStatusId: string, rowData: any) {
  const originalStatus = rowData.matterTaskStatusId;
  const originalStatusName = rowData.matterTaskStatusName;

  rowData.matterTaskStatusId = newStatusId;
  const statusItem = this.statusItems.find(
    (item) => (item as any).value === newStatusId,
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
        if (isSuccess) {
          this._toastrNotifiService.displaySuccess(
            'Status updated successfully',
          );
        } else {
          rowData.matterTaskStatusId = originalStatus;
          rowData.matterTaskStatusName = originalStatusName;
        }
      },
      error: () => {
        rowData.matterTaskStatusId = originalStatus;
        rowData.matterTaskStatusName = originalStatusName;
      },
    });
}

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
