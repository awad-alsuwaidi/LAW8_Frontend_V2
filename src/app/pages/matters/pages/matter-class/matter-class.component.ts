import {
  Component,
  effect,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { PAGESIZE } from 'src/app/@core/utilities/defines';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedTableComponent } from 'src/app/@shared/components/shared-table/shared-table.component';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';
import { MatterClassDto } from 'src/app/pages/matters/interfaces/matter-class.interface';
import { Matter_Class_Columns } from './matter-class-columns.config';
import { MatterClassAddComponent } from './matter-class-add/matter-class-add.component';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { LanguageService } from 'src/app/@core/services';
import { MatterClassUpdateComponent } from './matter-class-update/matter-class-update.component';
import { MatterService } from '../../services/matter.service';
import { EmptyConfig } from 'src/app/@shared/components/shared-empty-section/interface/empty-config.interface';
import { SharedEmptySectionComponent } from 'src/app/@shared/components/shared-empty-section/shared-empty-section.component';
import { Router } from '@angular/router';
import { MatterDetailsEditorComponent } from '../matter-editor/pages/matter-details-editor/matter-details-editor.component';
import { PermissionService } from 'src/app/@core/services/permission.service';

@Component({
  selector: 'app-matter-class',
  standalone: true,
  imports: [
    SharedTableComponent,
    SharedButtonComponent,
    SharedModule,
    SharedEmptySectionComponent,
  ],
  providers: [MatterDetailsEditorComponent],
  templateUrl: './matter-class.component.html',
  styleUrl: './matter-class.component.scss',
})
export class MatterClassComponent implements OnInit, OnDestroy {
  _apiService = inject(ApiService);
  _unsubscribeService = inject(UnsubscribeService);
  _dialogService = inject(DialogService);
  _languageService = inject(LanguageService);
  _matterService = inject(MatterService);
  matterDetailsEditorComponent = inject(MatterDetailsEditorComponent);
  _router = inject(Router);
    _permsissionsService = inject(PermissionService);

  data: MatterClassDto[] = [];
  columns: any[] = Matter_Class_Columns;
  pagination: any = { pagSize: PAGESIZE, pageNum: 1, orderByDirection: 'ASC' };
  first!: number;
  deleteDialogRef!: DynamicDialogRef;
  @Input() set id(value: number) {
    this.matterIdentifier = value;
  }
  matterIdentifier: any;
  formlyModel: any;
  getFormsData = effect(() => {
    if (this._matterService.getMatter()) {
      this.formlyModel = this._matterService.getMatter();
      if (!this.formlyModel.practsAreaId && this._router.url.includes('add'))
        this._router.navigate(['/matters/add']);
      console.log('this.formlyModel in class', this.formlyModel);
    }
  });
  emptyConfig?: EmptyConfig;
 ngOnInit(): void {
  this.emptyConfig = {
    messageTitle: this._languageService.getTransValue('matters.noClassTitle'),
    description: this._languageService.getTransValue('matters.noClassDescription'),
    addPermission: '',
  };

if (!this._router.url.includes('inactive') && this._permsissionsService.hasPermission('Add_Matter_Classes')) {
  const addButton = {
    label: this._languageService.getTransValue('matters.addNewClass'),
    command: () => {
      this.openAddClassEditor();
    },
  };
  this.emptyConfig.addButton = addButton;
}
  if (!this._router.url.includes('add')) {
    this.getClass();
  }
}

  openAddClassEditor() {
    const ref = this._dialogService.open(MatterClassAddComponent, {
      header: this._languageService.getTransValue('matters.addNewClass'),

      data: { matterIdentifier: this.matterIdentifier },
      width: '824px',
    });
    ref.onClose.subscribe({
      next: (result: any) => {
        if (typeof result === 'object') {
          this.data = result.map((obj: any) => {
            return {
              ...obj,
              id: this.data.length + 1,
            };
          });
          this._matterService.updateMatter({
            ...this.formlyModel,
            law_MatterClass: this.data,
          });
        } else if (typeof result === 'boolean') {
          this.getClass();
        }
      },
    });
  }
  openUpdateClassEditor(rowData: MatterClassDto) {
    const ref = this._dialogService.open(MatterClassUpdateComponent, {
      header: 'Update Class',
      data: { rowData, matterIdentifier: this.matterIdentifier },
      width: '720px',
    });
    ref.onClose.subscribe({
      next: (result: any) => {
        if (typeof result === 'object') {
          let index = this.data.findIndex((obj) => obj.id === result.id);
          this.data[index] = result;
          this._matterService.updateMatter({
            ...this.formlyModel,
            law_MatterClass: this.data,
          });
        } else if (typeof result === 'boolean') {
          this.getClass();
        }
      },
    });
  }
  onPageChange(e: any) {
    this.pagination.pagSize = Number(e.rows);
    this.pagination.pageNum = e.first / e.rows + 1;
    this.first = e?.first;
    this.getClass();
  }
  getClass() {
    this.pagination = {
      ...this.pagination,
      matterId: this.matterIdentifier,
    };
    this._apiService
      .get(API_Config.matterClass.get, this.pagination)
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.data = res.result.dataList;
            this.pagination.totalElements = res.result.totalCount;
            this.pagination = { ...this.pagination };
          }
        },
      });
  }
  onDelete(rowData: MatterClassDto) {
    this.deleteDialogRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        modal: true,
        styleClass: 'w-[400px]',
        data: {
          type: ConfirmDialogType.Danger,
          title: this._languageService.getTransValue(
            'matters.deleteClassTitle',
            { value: rowData?.classNo }
          ),
          message: this._languageService.getTransValue(
            'matters.deleteClassMessage'
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
                this.deleteParty(rowData);
              },
            },
          ],
        },
      }
    );
  }
  deleteParty(rowData: MatterClassDto) {
    if (this._router.url.includes('add')) {
      this.data = this.data.filter((obj) => obj != rowData);
      this.deleteDialogRef.close();
      return;
    }
    this._apiService
      .post(API_Config.matterClass.delete, {}, { id: rowData.id })
      .pipe(this._unsubscribeService.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.data.length == 1 ? this.pagination.pageNum-- : null;
            this.getClass();
            this.deleteDialogRef.close();
          }
        },
      });
  }
  ngOnDestroy(): void {
    this._unsubscribeService.destroy();
  }
}
