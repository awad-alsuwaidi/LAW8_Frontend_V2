import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { SharedModule } from 'src/app/@shared/shared.module';
import { PredefinedTaskDto } from './interfaces/predefined-tasks.interface';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { ApiService } from 'src/app/@core/api/api.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { matterTask_priorityConfig } from './predefined-task-priority.config';
import { Predefined_Task_Columns } from './predefined-task-columns.config';
import { LookupsPredefinedTasksFilterComponent } from './components/lookups-predefined-tasks-filter/lookups-predefined-tasks-filter.component';
import {
  MatterTaskPriority,
  MatterTaskPriorityLabel
} from '../../matters/enums/matter-taskPriority';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedBreadcrumbComponent } from 'src/app/@shared/components/shared-breadcrumb/shared-breadcrumb.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-lookups-predefined-tasks',
  standalone: true,
  imports: [
    SharedTableComponent,
    SharedModule,
    SharedButtonComponent,
    LookupsPredefinedTasksFilterComponent,
    SharedBreadcrumbComponent,
  ],
  templateUrl: './lookups-predefined-tasks.component.html',
  styleUrl: './lookups-predefined-tasks.component.scss',
})
export class LookupsPredefinedTasksComponent implements OnInit, OnDestroy {
  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _dialogService = inject(DialogService);
  private _languageService = inject(LanguageService);
  private _toastrNotifiService = inject(ToastrNotifiService);
  protected _router = inject(Router);
  protected _route = inject(ActivatedRoute);
  protected data: PredefinedTaskDto[] = [];
  protected columns: any[] = Predefined_Task_Columns;
  protected priorityConfig = matterTask_priorityConfig;
  protected pagination: any = {
    pagSize: PAGESIZE,
    pageNum: 1,
    orderByDirection: 'ASC',
  };
  protected first!: number;
  private deleteDialogRef!: DynamicDialogRef;
  isLoading: boolean = false;
  ngOnInit(): void {
    this.getData();
  }
  onFilter(e: any) {
    this.pagination.SearchTerm = e.SearchTerm;
    this.getData();
  }
  onPageChange(e: any) {
    this.pagination.pagSize = Number(e.rows);
    this.pagination.pageNum = e.first / e.rows + 1;
    this.first = e?.first;
    this.getData();
  }

  getData() {
    this.isLoading = true;
    this.pagination = { ...this.pagination };

    this._apiService
      .get(API_Config.predefinedTasks.get, this.pagination)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.data = res.result?.items ?? [];
            this.pagination.totalElements = res.result?.totalCount ?? 0;
            this.pagination = { ...this.pagination };
          }
        },
        error: (err) => console.error(err),
      });
  }

  deleteTask(TaskId: number) {
    this._apiService
      .delete(`${API_Config.predefinedTasks.delete}/${TaskId}`)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            if (this.data.length === 1) this.pagination.pageNum--;
            this.getData();
            this._toastrNotifiService.displaySuccess(res.message);
            this.deleteDialogRef.close();
          }
        },
      });
  }
  onSort(event: any) {
    this.pagination.orderBy = event.field;
    this.pagination.orderByDirection = event.order === 1 ? 'ASC' : 'DESC';
    this.getData();
  }
  getPriorityIdFromPriorityName(priorityLabel: string) {
    const priority = Object.keys(MatterTaskPriorityLabel).find(
      (key) => MatterTaskPriorityLabel[key] === priorityLabel,
    );
    return priority ? (Number(priority) as MatterTaskPriority) : undefined;
  }
  onDelete(rowData: PredefinedTaskDto) {
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
              label: this._languageService.getTransValue('lookups.discard'),
              styleClass: 'border border-grey500 text-grey500',
              command: () => {
                this.deleteDialogRef.close();
              },
            },
            {
              label: this._languageService.getTransValue('lookups.delete'),
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

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
