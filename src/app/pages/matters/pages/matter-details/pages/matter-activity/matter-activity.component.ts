// // import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
// // import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
// // import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
// // import { SharedModule } from 'src/app/@shared/shared.module';
// // import { Matter_Activity_Columns } from './matter-activity-columns.config';
// // import { PAGESIZE } from 'src/app/@core/utilities/defines';
// // import { MatterActivityDto } from 'src/app/pages/matters/interfaces/matter-activity.interface';
// // import { matterActivity_statusConfig } from './matter-activity-status.config';
// // import { API_Config } from 'src/app/@core/api/api-config/api.config';
// // import { ApiRes } from 'src/app/@core/models/apiRes-model';
// // import { ApiService } from 'src/app/@core/api/api.service';
// // import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
// // import { MatterActivityEditorComponent } from './matter-activity-editor/matter-activity-editor.component';
// // import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
// // import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
// // import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
// // import { LanguageService } from 'src/app/@core/services';
// // import { Router } from '@angular/router';
// // import { finalize } from 'rxjs';

// // @Component({
// //   selector: 'app-matter-activity',
// //   standalone: true,
// //   imports: [SharedTableComponent, SharedButtonComponent, SharedModule],
// //   templateUrl: './matter-activity.component.html',
// //   styleUrl: './matter-activity.component.scss',
// // })
// // export class MatterActivityComponent implements OnInit, OnDestroy {
// //   _apiService = inject(ApiService);
// //   _unsubscribeService = inject(UnsubscribeService);
// //   _dialogService = inject(DialogService);
// //   _languageService = inject(LanguageService);
// //   _router = inject(Router);
// //   data: MatterActivityDto[] = [];
// //   columns: any[] = Matter_Activity_Columns;
// //   statusConfig = matterActivity_statusConfig;
// //   pagination: any = {
// //     pagSize: PAGESIZE,
// //     pageNum: 1,
// //     orderByDirection: 'DSC',
// //     orderBy: 'startDate',
// //   };
// //   first!: number;
// //   isLoading!: boolean;
// //   deleteDialogRef!: DynamicDialogRef;
// //   @Input() set id(value: number) {
// //     this.matterIdentifier = value;
// //   }
// //   matterIdentifier: any;
// //   ngOnInit(): void {
// //     this.getActivity();
// //   }

// //   onPageChange(e: any) {
// //     this.pagination.pagSize = Number(e.rows);
// //     this.pagination.pageNum = e.first / e.rows + 1;
// //     this.first = e?.first;
// //     this.getActivity();
// //   }

// // onSort(e: any) {
// //   const field = e.field;
// //   if (!field) return;

// //   if (this.pagination.orderBy !== field) {
// //     this.pagination.orderBy = field;
// //     this.pagination.orderByDirection = 'DESC';
// //   } else {
// //     this.pagination.orderByDirection =
// //       this.pagination.orderByDirection === 'DESC' ? 'ASC' : 'DESC';
// //   }

// //   console.log("Sorting:", this.pagination.orderBy, this.pagination.orderByDirection);

// //   this.pagination.pageNum = 1;
// //   this.first = 0;
// //   this.getActivity();
// // }


// // getActivity() {
// //   this.pagination.matterId = this.matterIdentifier;
// //   this.isLoading = true;
// //   this._apiService
// //     .get(API_Config.matterActivity.get, this.pagination)
// //     .pipe(
// //       this._unsubscribeService.takeUntilDestroy(),
// //       finalize(() => this.isLoading = false) 
// //     )
// //     .subscribe({
// //       next: (res: ApiRes) => {
// //         if (res && res.isSuccess) {
// //           this.data = res.result.dataList;
// //           this.pagination.totalElements = res.result.totalCount;
// //           this.pagination = { ...this.pagination };
// //         }
// //       },
// //       error: () => {
       
// //       }
// //     });
// // }

// //   onDelete(rowData: MatterActivityDto) {
// //     this.deleteDialogRef = this._dialogService.open(
// //       SharedConfirmDialogComponent,
// //       {
// //         modal: true,
// //         styleClass: 'w-[406px]',
// //         data: {
// //           type: ConfirmDialogType.Danger,
// //           title: this._languageService.getTransValue(
// //             'matters.deleteActivityTitle',
// //             { value: rowData?.id }
// //           ),
// //           message: this._languageService.getTransValue(
// //             'matters.deleteActivityMessage'
// //           ),
// //           btns: [
// //             {
// //               label: 'Discard',
// //               styleClass: 'border border-grey500 text-grey500',
// //               command: () => {
// //                 this.deleteDialogRef.close();
// //               },
// //             },
// //             {
// //               label: 'Delete',
// //               styleClass: 'bg-textErrorBase text-white',
// //               command: () => {
// //                 this.deleteActivity(rowData.id);
// //               },
// //             },
// //           ],
// //         },
// //       }
// //     );
// //   }
// //   deleteActivity(activityId: number) {
// //     this._apiService
// //       .post(API_Config.matterActivity.delete, {}, { id: activityId })
// //       .pipe(this._unsubscribeService.takeUntilDestroy())
// //       .subscribe({
// //         next: (res: ApiRes) => {
// //           if (res && res.isSuccess) {
// //             this.data.length == 1 ? this.pagination.pageNum-- : null;
// //             this.getActivity();
// //             this.deleteDialogRef.close();
// //           }
// //         },
// //       });
// //   }
// //   // openActivityEditor(rowData?: MatterActivityDto) {
// //   //   const ref = this._dialogService.open(MatterActivityEditorComponent, {
// //   //     header: rowData
// //   //       ? this._languageService.getTransValue('matters.updateActivity')
// //   //       : this._languageService.getTransValue('matters.addActivity'),
// //   //     data: { rowData, matterIdentifier: this.matterIdentifier },
// //   //     width: '720px',
// //   //   });
// //   //   ref.onClose.subscribe({
// //   //     next: (res: any) => {
// //   //       if (res) this.getActivity();
// //   //     },
// //   //   });
// //   // }
  
// //     openActivityEditor(rowData?: MatterActivityDto) {
// //     const ref = this._dialogService.open(
// //       MatterActivityEditorComponent,
// //       {
// //         // header: this._router.url.includes('hearing-session')
// //         //   ? (rowData ? 'Update Hearing Session' : 'Add Hearing Session')
// //         //   : (rowData ? 'Update Activity' : 'Add Activity'),
// //         header: this._router.url.includes('hearing-session')
// //           ? rowData
// //             ? this._languageService.getTransValue(
// //                 'matters.updateHearingSession'
// //               )
// //             : this._languageService.getTransValue('matters.addHearingSession')
// //           : rowData
// //           ? this._languageService.getTransValue('matters.updateActivity')
// //           : this._languageService.getTransValue('matters.addActivity'),

// //         data: { rowData, matterIdentifier: this.matterIdentifier },
// //         width: '720px',
// //       }
// //     );
// //     ref.onClose.subscribe({
// //       next: (res: any) => {
// //         if (res) this.getActivity();
// //       },
// //     });
// //   }

// //   openActivityViewer(rowData: MatterActivityDto) {
// //   const ref = this._dialogService.open(
// //     MatterActivityEditorComponent,
// //     {
// //       header: this._router.url.includes('hearing-session')
// //         ? this._languageService.getTransValue('matters.viewHearingSession')
// //         : this._languageService.getTransValue('matters.viewActivity'),
// //       data: { 
// //         rowData, 
// //         matterIdentifier: this.matterIdentifier,
// //         mode: 'view'   
// //       },
// //       width: '720px',
// //     }
// //   );
// //   ref.onClose.subscribe({
// //     next: (res: any) => {
// //     }
// //   });
// // }

// //   ngOnDestroy(): void {
// //     this._unsubscribeService.destroy();
// //   }
// // }


import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { Matter_Activity_Columns } from './matter-activity-columns.config';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { MatterActivityDto } from 'src/app/pages/matters/interfaces/matter-activity.interface';
import { matterActivity_statusConfig } from './matter-activity-status.config';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { ApiService } from 'src/app/@core/api/api.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { MatterActivityEditorComponent } from './matter-activity-editor/matter-activity-editor.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { LanguageService } from 'src/app/@core/services';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-matter-activity',
  standalone: true,
  imports: [SharedTableComponent, SharedButtonComponent, SharedModule],
  templateUrl: './matter-activity.component.html',
  styleUrl: './matter-activity.component.scss',
})
export class MatterActivityComponent implements OnInit, OnDestroy {
  _apiService = inject(ApiService);
  _unsubscribeService = inject(UnsubscribeService);
  _dialogService = inject(DialogService);
  _languageService = inject(LanguageService);
  _router = inject(Router);
  data: MatterActivityDto[] = [];
  columns: any[] = Matter_Activity_Columns;
  statusConfig = matterActivity_statusConfig;
  pagination: any = {
    pagSize: PAGESIZE,
    pageNum: 1,
    orderByDirection: 'DSC',
    orderBy: 'startDate',
  };
  first!: number;
  isLoading!: boolean;
  deleteDialogRef!: DynamicDialogRef;
  @Input() set id(value: number) {
    this.matterIdentifier = value;
  }
  matterIdentifier: any;
  ngOnInit(): void {
    this.getActivity();
  }

  onPageChange(e: any) {
    this.pagination.pagSize = Number(e.rows);
    this.pagination.pageNum = e.first / e.rows + 1;
    this.first = e?.first;
    this.getActivity();
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

    this.pagination.pageNum = 1;
    this.first = 0;
    this.getActivity();
  }

  getActivity() {
    this.pagination.matterId = this.matterIdentifier;
    this.isLoading = true;
    this._apiService
      .get(API_Config.matterActivity.get, this.pagination)
      .pipe(
        this._unsubscribeService.takeUntilDestroy(),
        finalize(() => this.isLoading = false) 
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.data = res.result.dataList;
            this.pagination.totalElements = res.result.totalCount;
            this.pagination = { ...this.pagination };
          }
        },
        error: () => {
       
        }
      });
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

  deleteActivity(activityId: number) {
    this._apiService
      .post(API_Config.matterActivity.delete, {}, { id: activityId })
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.data.length == 1 ? this.pagination.pageNum-- : null;
            this.getActivity();
            this.deleteDialogRef.close();
          }
        },
      });
  }

  openActivityViewer(rowData: MatterActivityDto) {
    const ref = this._dialogService.open(
      MatterActivityEditorComponent,
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
        if (res) this.getActivity();
      }
    });
  }

  openActivityEditor(rowData?: MatterActivityDto) {
    const ref = this._dialogService.open(
      MatterActivityEditorComponent,
      {
        header: this._router.url.includes('hearing-session')
          ? rowData
            ? this._languageService.getTransValue(
                'matters.updateHearingSession'
              )
            : this._languageService.getTransValue('matters.addHearingSession')
          : rowData
          ? this._languageService.getTransValue('matters.updateActivity')
          : this._languageService.getTransValue('matters.addActivity'),

        data: { 
          rowData, 
          matterIdentifier: this.matterIdentifier,
          mode: 'edit'  
        },
        width: '720px',
      }
    );
    ref.onClose.subscribe({
      next: (res: any) => {
        if (res) this.getActivity();
      },
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeService.destroy();
  }
}