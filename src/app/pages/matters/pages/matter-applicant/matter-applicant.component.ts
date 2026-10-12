import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { MatterApplicantEditorComponent } from './matter-applicant-editor/matter-applicant-editor.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { MatterApplicantDto } from 'src/app/pages/matters/interfaces/matter-applicant.interface';
import { MatterService } from '../../services/matter.service';
import { MatterDetailsEditorComponent } from '../matter-editor/pages/matter-details-editor/matter-details-editor.component';
import { EmptyConfig } from 'src/app/@shared/components/shared-empty-section/interface/empty-config.interface';
import { SharedEmptySectionComponent } from 'src/app/@shared/components/shared-empty-section/shared-empty-section.component';
import { PermissionService } from 'src/app/@core/services/permission.service';

@Component({
  selector: 'app-matter-applicant',
  standalone: true,
  imports: [
    SharedButtonComponent,
    SharedModule,
    MenuModule,
    PaginatorModule,
    SharedEmptySectionComponent,
  ],
  providers: [MatterDetailsEditorComponent],
  templateUrl: './matter-applicant.component.html',
  styleUrl: './matter-applicant.component.scss',
})
export class MatterApplicantComponent implements OnInit, OnDestroy {
  _permissionService = inject(PermissionService);
  _languageService = inject(LanguageService);

  selectedRow?: MatterApplicantDto;

  menuItems: MenuItem[] = [
    {
      label: this._languageService.getTransValue('matters.viewDetails'),
      icon: 'icon-show',
      visible: this._permissionService.hasPermission('View_Matter_Applicants'),
      command: () => {
        this.onOpenApplicantEditor('view');
      },
    },
    { separator: true },
    {
      label: this._languageService.getTransValue('matters.edit'),
      icon: 'icon-edit',
      visible: this._permissionService.hasPermission(
        'Update_Matter_Applicants'
      ),

      command: () => {
        this.onOpenApplicantEditor('edit');
      },
    },
    { separator: true },
    {
      label: this._languageService.getTransValue('matters.delete'),
      icon: 'icon-trash',
      visible: this._permissionService.hasPermission(
        'Delete_Matter_Applicants'
      ),

      command: () => {
        this.onDelete();
      },
    },
  ];
  totalRecords: number = 0;
  applicants: MatterApplicantDto[] = [];
  _dialogService = inject(DialogService);
  _apiService = inject(ApiService);
  _unsubscribe = inject(UnsubscribeService);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _toastrNotifiService = inject(ToastrNotifiService);
  _matterService = inject(MatterService);
  matterDetailsEditorComponent = inject(MatterDetailsEditorComponent);
  matterIdentifier!: number;
  filterOptions: any = {
    pageNum: 1,
    pagSize: 5,
    orderByDirection: 'ASC',
  };
  formlyModel: any;
  getFormsData = effect(() => {
    if (this._matterService.getMatter()) {
      this.formlyModel = this._matterService.getMatter();
      if (!this.formlyModel.practsAreaId && this._router.url.includes('add'))
        this._router.navigate(['/matters/add']);
      console.log('this.formlyModel in applicant', this.formlyModel);
    }
  });
  emptyConfig?: EmptyConfig;
  ngOnInit(): void {
    this.emptyConfig = {
      messageTitle: this._languageService.getTransValue(
        'matters.noApplicantTitle'
      ),
      description: this._languageService.getTransValue(
        'matters.noApplicantDescription'
      ),
      addPermission: '',
    };

    if (
      !this._router.url.includes('inactive') &&
      this._permsissionsService.hasPermission('Add_Matter_Applicants')
    ) {
      const addButton = {
        label: this._languageService.getTransValue('matters.addNewApplicant'),
        command: () => {
          this.onOpenApplicantEditor();
        },
      };
      this.emptyConfig.addButton = addButton;
    }
    if (!this._router.url.includes('add')) this.getParams();
  }
  getParams() {
    this._route.params.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
      next: (params: Params) => {
        if (params['id']) {
          this.matterIdentifier = params['id'];
        }
        this.getApplicants();
      },
    });
  }
  _permsissionsService = inject(PermissionService);

  onRowSelected(rowData: MatterApplicantDto) {
    this.selectedRow = rowData;
  }

  onOpenApplicantEditor(mode?: string) {
    const ref = this._dialogService.open(MatterApplicantEditorComponent, {
      header: mode
        ? mode === 'view'
          ? this._languageService.getTransValue('matters.viewApplicant')
          : this._languageService.getTransValue('matters.editApplicant')
        : this._languageService.getTransValue('matters.addApplicant'),
      width: '600px',
      data: { rowData: this.selectedRow, mode, id: this.matterIdentifier },
    });
    ref.onClose
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe((result: any) => {
        this.selectedRow = undefined;
        if (typeof result === 'object') {
          let index = this.applicants.findIndex((obj) => obj.id === result.id);
          if (index != -1) {
            this.applicants[index] = result;
          } else {
            this.applicants.push({ ...result, id: this.applicants.length + 1 });
          }
          this.totalRecords = this.applicants.length;

          this._matterService.updateMatter({
            ...this.formlyModel,
            law_MatterApplicants: this.applicants,
          });
        } else if (typeof result === 'boolean') {
          this.getApplicants();
        }
      });
  }
  onDelete() {
    const confirmDeleteRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        data: {
          type: ConfirmDialogType.Success,
          title: this._languageService.getTransValue(
            'matters.areYouSureYouWantDelete?'
          ),
          message: this._languageService.getTransValue(
            'matters.youWillDeleteApplicant?'
          ),
          btns: [
            {
              label: this._languageService.getTransValue('matters.cancel'),
              styleClass: 'border border-grey500 text-grey500',
              command: () => {
                confirmDeleteRef.close();
              },
            },
            {
              label: this._languageService.getTransValue('matters.delete?'),
              styleClass: 'bg-textErrorBase text-white',
              command: () => {
                confirmDeleteRef.close(true);
              },
            },
          ],
        },
      }
    );
    confirmDeleteRef.onClose.subscribe({
      next: (res) => {
        if (res) {
          if (this._router.url.includes('add')) {
            this.applicants = this.applicants.filter(
              (obj) => obj != this.selectedRow
            );
            this.totalRecords = this.applicants.length;
            this.selectedRow = undefined;
            confirmDeleteRef.close();
            return;
          }
          this._apiService
            .post(
              API_Config.matterApplicant.delete,
              {},
              { id: this.selectedRow?.id }
            )
            .pipe(this._unsubscribe.takeUntilDestroy())
            .subscribe({
              next: (res: ApiRes) => {
                if (res && res.isSuccess) {
                  this.selectedRow = undefined;
                  this._toastrNotifiService.displaySuccess(res.message);
                  this.getApplicants();
                }
              },
            });
        }
      },
    });
  }
  getApplicants() {
    this.filterOptions = {
      ...this.filterOptions,
      matterId: this.matterIdentifier,
    };

    this._apiService
      .get(API_Config.matterApplicant.get, this.filterOptions)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this.applicants = res.result.dataList;
            this.totalRecords = res.result.totalCount;
          }
        },
      });
  }
  onPageChange(event: any): void {
    this.filterOptions.pagSize = Number(event.rows);
    this.filterOptions.pageNum = event.first / event.rows + 1;
    this.filterOptions = { ...this.filterOptions };
    this.getApplicants();
  }
  nextPage() {
    this._router.navigate(['../billing'], { relativeTo: this._route })
    this._matterService.updateRefreshCurrentTab(true)
  }
  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
