import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { LookupTaskGroupsDto } from './interfaces/lookups-task-groups.interface';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { ApiService } from 'src/app/@core/api/api.service';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { ActivatedRoute, Router } from '@angular/router';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { Task_Groups_Columns } from './task-groups-columns.config';
import { SharedBreadcrumbComponent } from 'src/app/@shared/components/shared-breadcrumb/shared-breadcrumb.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-lookups-task-groups',
  standalone: true,
  imports: [
    SharedTableComponent,
    SharedModule,
    SharedButtonComponent,
    SharedBreadcrumbComponent,
  ],
  templateUrl: './lookups-task-groups.component.html',
  styleUrl: './lookups-task-groups.component.scss',
})
export class LookupsTaskGroupsComponent implements OnInit, OnDestroy {
  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _dialogService = inject(DialogService);
  private _languageService = inject(LanguageService);
  private _toastrNotifiService = inject(ToastrNotifiService);
  protected _router = inject(Router);
  protected _route = inject(ActivatedRoute);
  protected data: LookupTaskGroupsDto[] = [];
  protected columns: any[] = Task_Groups_Columns;
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
    this.pagination.search = e.search;
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
      .get(API_Config.taskGroups.get, this.pagination)
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

  onDelete(rowData: LookupTaskGroupsDto) {
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
  onSort(event: any) {
    this.pagination.orderBy = event.field;
    this.pagination.orderByDirection = event.order === 1 ? 'ASC' : 'DESC';
    this.getData();
  }

  deleteTask(TaskId: number) {
    this._apiService
      .delete(`${API_Config.taskGroups.delete}/${TaskId}`)
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

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
