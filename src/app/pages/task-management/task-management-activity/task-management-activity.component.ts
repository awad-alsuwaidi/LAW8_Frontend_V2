import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService } from 'src/app/@core/services';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { MatterActivityDto } from '../../matters/interfaces/matter-activity.interface';
import { Router } from '@angular/router';
import { matterActivity_statusConfig } from './task-management-activity-status.config';
import { Activity_Columns } from './task-management-activity-columns.config';
import { HEARING_SESSION_Columns } from './task-management-hearing-session-columns.config';
import { TaskManagementActivityEditorComponent } from '../components/task-management-activity-editor/task-management-activity-editor.component';
import { DropdownModule } from 'primeng/dropdown';
import { TaskManagementFilterActivityEditorComponent } from '../components/task-management-filter-activity-editor/task-management-filter-activity-editor.component';
import { TmSessionFilterEditorComponent } from '../components/tm-session-filter-editor/tm-session-filter-editor.component';
import { CalenderFilterChipsComponent } from '../calendar/components/calender-filter-chips/calender-filter-chips.component';
import { SharedEmptySectionComponent } from '../../../@shared/components/shared-empty-section/shared-empty-section.component';
import { EmptyConfig } from 'src/app/@shared/components/shared-empty-section/interface/empty-config.interface';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-task-management-activity',
  standalone: true,
  imports: [
    SharedTableComponent,
    SharedButtonComponent,
    SharedModule,
    DropdownModule,
    TaskManagementFilterActivityEditorComponent,
    TmSessionFilterEditorComponent,
    CalenderFilterChipsComponent,
    SharedEmptySectionComponent,
  ],
  templateUrl: './task-management-activity.component.html',
  styleUrl: './task-management-activity.component.scss',
})
export class TaskManagementActivityComponent implements OnInit, OnDestroy {
  _apiService = inject(ApiService);
  _unsubscribeService = inject(UnsubscribeService);
  _dialogService = inject(DialogService);
  _languageService = inject(LanguageService);
  _router = inject(Router);
  data: MatterActivityDto[] = [];
  columns!: any[];
  statusConfig = matterActivity_statusConfig;
  pagination: any = {
    pagSize: PAGESIZE,
    pageNum: 1,
    orderByDirection: 'DESC',
    orderBy: 'startDate',
  };
  first!: number;
  filter: any;
  deleteDialogRef!: DynamicDialogRef;
  isLoading: boolean = false;
  @Input() set id(value: number) {
    this.matterIdentifier = value;
  }
  matterIdentifier: any;
  emptyConfig: EmptyConfig = {
    messageTitle: this._languageService.getTransValue('common.nodataavailable'),
    // description: this._languageService.getTransValue('matters.emptyDescriptionParty'),
    addPermission: '',
  };
  ngOnInit(): void {
    this.columns = this._router.url.includes('hearing-session')
      ? HEARING_SESSION_Columns
      : Activity_Columns;
    this.getData();
    
  }

  openActivityViewer(rowData: MatterActivityDto) {
  const ref = this._dialogService.open(
    TaskManagementActivityEditorComponent,
    {
      header: this._router.url.includes('hearing-session')
        ? this._languageService.getTransValue('matters.viewHearingSession')
        : this._languageService.getTransValue('matters.viewActivity'),
      data: { 
        rowData, 
        matterIdentifier: this.matterIdentifier,
        mode: 'view'   
      },
      width: '720px',
    }
  );
  ref.onClose.subscribe({
    next: (res: any) => {
    }
  });
}

  openActivityEditor(rowData?: MatterActivityDto) {
    const ref = this._dialogService.open(
      TaskManagementActivityEditorComponent,
      {
        // header: this._router.url.includes('hearing-session')
        //   ? (rowData ? 'Update Hearing Session' : 'Add Hearing Session')
        //   : (rowData ? 'Update Activity' : 'Add Activity'),
        header: this._router.url.includes('hearing-session')
          ? rowData
            ? this._languageService.getTransValue(
                'matters.updateHearingSession'
              )
            : this._languageService.getTransValue('matters.addHearingSession')
          : rowData
          ? this._languageService.getTransValue('matters.updateActivity')
          : this._languageService.getTransValue('matters.addActivity'),

        data: { rowData, matterIdentifier: this.matterIdentifier },
        width: '720px',
      }
    );
    ref.onClose.subscribe({
      next: (res: any) => {
        if (res) this.getData();
      },
    });
  }
  onPageChange(e: any) {
    this.pagination.pagSize = Number(e.rows);
    this.pagination.pageNum = e.first / e.rows + 1;
    this.first = e?.first;
    this.getData();
  }

  onDelete(rowData: MatterActivityDto) {
    this.deleteDialogRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        modal: true,
        styleClass: 'w-[406px]',
        data: {
          type: ConfirmDialogType.Danger,
          title: this._languageService.getTransValue(
            'matters.deleteActivityTitle',
            { value: rowData?.id }
          ),
          message: this._languageService.getTransValue(
            'matters.deleteActivityMessage'
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
                this.deleteActivity(rowData.id);
              },
            },
          ],
        },
      }
    );
  }

  onFilterUpdate(e: any) {
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
      TypeId: e.TypeId?.value ?? null,
      UserId: e.UserId?.value ?? null,
      search: e.search ?? null,
    };

    console.log('Calling getData with pagination:', this.pagination);
    this.getData();
  }

 
  onActivityFilter(e: any) {
    this.pagination = {
      ...this.pagination,
      ...e,
    };
    this.getData();
  }

  getData() {
    const isHearing = this._router.url.includes('hearing-session');
    this.isLoading = true;

    const params: any = {
      pageNumber: this.pagination.pageNum,
      pageSize: this.pagination.pagSize,
      sortBy: this.pagination.orderBy,
      isDescending: this.pagination.orderByDirection === 'DESC',
      'filters[kind]': isHearing ? 'hearing' : 'activity',
    };

    if (this.pagination.search) params.searchTerm = this.pagination.search;
    if (this.pagination.StatusId) params['filters[statusId]'] = this.pagination.StatusId;
    if (this.pagination.TypeId) params['filters[activityTypeId]'] = this.pagination.TypeId;
    if (this.pagination.AvailabilityId) params['filters[availability]'] = this.pagination.AvailabilityId;
    if (this.pagination.UserId) params['filters[userId]'] = this.pagination.UserId;
    if (this.pagination.FromDate) params['filters[from]'] = this.pagination.FromDate;
    if (this.pagination.ToDate) params['filters[to]'] = this.pagination.ToDate;

    const path = API_Config.matterActivity.get;

    this._apiService.get(path, params)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribeService.takeUntilDestroy()
      )
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          const body = res?.data ?? res?.result;
          
          if (isSuccess && body) {
            this.data = body.items || []; 
            this.pagination.totalElements = body.totalCount || 0;
            this.pagination = { ...this.pagination };
          }
        },
      });
  }

  deleteActivity(activityId: number) {
    const url = API_Config.matterActivity.delete.replace('{id}', String(activityId));
    
    this._apiService.delete(url)
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const isSuccess = res?.success ?? res?.isSuccess;
          if (isSuccess) {
            this.data.length == 1 ? this.pagination.pageNum-- : null;
            this.getData();
            this.deleteDialogRef.close();
          }
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
  this.getData();
}



  ngOnDestroy(): void {
    this._unsubscribeService.destroy();
  }
}
