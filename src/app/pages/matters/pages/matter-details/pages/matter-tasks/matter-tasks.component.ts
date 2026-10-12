import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
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
  _toastrNotifiService = inject(ToastrNotifiService)
  _router = inject(Router);
  data: MatterTaskDto[] = [];
  statusItems: StatusMenuItem[] = [];
  columns: any[] = Matter_Task_Columns;
  statusConfig = matterTask_statusConfig;
  priorityConfig = matterTask_priorityConfig;
  pagination: any = { pagSize: PAGESIZE, pageNum: 1, orderByDirection: 'ASC' };
  first!: number;
  deleteDialogRef!: DynamicDialogRef;
  @Input() set id(value: number) {
    this.matterIdentifier = value;
  }
  matterIdentifier: any;
  ngOnInit(): void {
    this.getTask();
    this.getStatusMenu();
  }

  openTaskEditor(rowData?: MatterTaskDto, mode?: string) {
    console.log('openTaskEditor:', { rowData, mode });
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

  if (this.pagination.orderBy !== field) {
    this.pagination.orderBy = field;
    this.pagination.orderByDirection = 'DESC';
  } else {
    this.pagination.orderByDirection =
      this.pagination.orderByDirection === 'DESC' ? 'ASC' : 'DESC';
  }

  console.log("Sorting:", this.pagination.orderBy, this.pagination.orderByDirection);

  this.pagination.pageNum = 1;
  this.first = 0;
  this.getTask();
}

  onPageChange(e: any) {
    this.pagination.pagSize = Number(e.rows);
    this.pagination.pageNum = e.first / e.rows + 1;
    this.first = e?.first;
    this.getTask();
  }

  isLoading!: boolean;

  getTask() {
    this.pagination = {
      ...this.pagination,
      matterId: this.matterIdentifier,
    };

    this.isLoading = true;

    this._apiService
      .get(API_Config.matterTask.get, this.pagination)
      .pipe(
        this._unsubscribe.takeUntilDestroy(),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.data = res.result.dataList;
            this.pagination.totalElements = res.result.totalCount;
            this.pagination = { ...this.pagination };
          }
        },
        error: (err) => {
        },
      });
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
            { value: rowData?.id }
          ),
          message: this._languageService.getTransValue(
            'matters.deleteTaskMessage'
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
      }
    );
  }

deleteTask(TaskId: number) {
  this._apiService
    .post(API_Config.matterTask.delete, {}, { id: TaskId })
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res: ApiRes) => {

        if (res?.isSuccess) {

          this._toastrNotifiService.displaySuccess(
            res.message || 'Task deleted successfully'
          );

          this.data.length == 1 ? this.pagination.pageNum-- : null;
          this.getTask();
          this.deleteDialogRef.close();

        } else {
          this._toastrNotifiService.displayError(
            res?.message || 'Failed to delete task'
          );
        }
      },

      error: () => {
        this._toastrNotifiService.displayError(
          'Something went wrong while deleting task'
        );
      }
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
    console.log('Selected Status:', newStatusId, 'for row:', rowData);

    const originalStatus = rowData.status;
    const originalStatusName = rowData.statusName;

    rowData.status = newStatusId;
    const statusItem = this.statusItems.find(
      (item) => (item as any).value === newStatusId
    );
    rowData.statusName = statusItem ? statusItem.label : originalStatusName;
    this._apiService
      .post(
        API_Config.matterTask.changeStatus,
        {},
        {
          TaskId: rowData.id,
          newStatusId: newStatusId,
        }
      )
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            console.log('Status updated successfully');
          } else {
            rowData.status = originalStatus;
            rowData.statusName = originalStatusName;
          }
        },
        error: (error) => {
          rowData.status = originalStatus;
          rowData.statusName = originalStatusName;
        },
      });
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
