import {
  Component,
  effect,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SharedStatusComponent } from 'src/app/@shared/components/shared-status/shared-status.component';
import { matter_Parties_statusConfig } from './matter-party-status.config';
import { DialogService } from 'primeng/dynamicdialog';
import { MatterPartyEditorComponent } from './components/matter-party-editor/matter-party-editor.component';
import { MatterPartyDto } from 'src/app/pages/matters/interfaces/matter-party.interface';
import { SharedConfirmDialogComponent } from 'src/app/@shared/components/shared-confirm-dialog/shared-confirm-dialog.component';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { ConfirmDialogType } from 'src/app/@shared/enums/confirm-dialog-type';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { ApiService } from 'src/app/@core/api/api.service';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { PaginatorModule } from 'primeng/paginator';
import { matterPartyColumns } from './matter-party-columns.config';
import { ActivatedRoute, Router } from '@angular/router';
import { MatterDetailsEditorComponent } from '../matter-editor/pages/matter-details-editor/matter-details-editor.component';
import { MatterService } from '../../services/matter.service';
import { SharedEmptySectionComponent } from 'src/app/@shared/components/shared-empty-section/shared-empty-section.component';
import { EmptyConfig } from 'src/app/@shared/components/shared-empty-section/interface/empty-config.interface';

@Component({
  selector: 'app-matter-party',
  standalone: true,
  imports: [
    TableModule,
    SharedButtonComponent,
    SharedModule,
    SharedStatusComponent,
    PaginatorModule,
    SharedEmptySectionComponent,
  ],
  providers: [MatterDetailsEditorComponent],
  templateUrl: './matter-party.component.html',
  styleUrl: './matter-party.component.scss',
})
export class MatterPartyComponent implements OnInit, OnDestroy {
  _dialogService = inject(DialogService);
  _languageService = inject(LanguageService);
  _unsubscribe = inject(UnsubscribeService);
  _apiService = inject(ApiService);
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _matterService = inject(MatterService);
  matterDetailsEditorComponent = inject(MatterDetailsEditorComponent);
  _toastrNotifiService = inject(ToastrNotifiService);

  deleteDialogRef: any;
  data: MatterPartyDto[] = [];
  totalRecords: number = 0;
  partiesStatusConfig = matter_Parties_statusConfig;
  matterPartyColumns = matterPartyColumns;
  filterOptions: any = {
    pageNum: 1,
    pagSize: 5,
    orderByDirection: 'ASC',
  };
  // emptyConfig: EmptyConfig = {
  //   messageTitle: 'No Parties',
  //   description: 'You have no Parties yet، Start adding Parties on the top corner button',
  //   addPermission:'',
  //   addButton: {
  //     label: 'Add New Party',

  //     command: () => {
  //       this.openPartyEditor()
  //     }
  //   }
  // }
  emptyConfig: EmptyConfig = {
    messageTitle: this._languageService.getTransValue(
      'matters.emptyTitleParty',
    ),
    description: this._languageService.getTransValue(
      'matters.emptyDescriptionParty',
    ),
    addPermission: '',
    addButton: {
      label: this._languageService.getTransValue('matters.addNewParty'),
      command: () => {
        this.openPartyEditor();
      },
    },
  };

  @Input() set id(value: number) {
    this.matterIdentifier = value;
  }
  matterIdentifier: any;
  // collect form data from pervious steps
  formlyModel: any;
  getFormsData = effect(() => {
    if (this._matterService.getMatter()) {
      this.formlyModel = this._matterService.getMatter();
      if (this.formlyModel?.law_MatterParties)
        this.data = [...this.formlyModel.law_MatterParties];
      if (!this.formlyModel.practsAreaId && this._router.url.includes('add'))
        this._router.navigate(['/matters/add']);
      console.log('this.formlyModel in parties', this.formlyModel);
      this.totalRecords = this.data.length;
    }
  });
  ngOnInit(): void {
    if (!this._router.url.includes('add')) this.getParties();
  }

  getParties() {
    this.filterOptions = {
      ...this.filterOptions,
      matterId: this.matterIdentifier,
    };
    this._apiService
      .get(API_Config.matterParties.get, this.filterOptions)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.data = res.result.dataList;
            this.totalRecords = res.result.totalCount;
          }
        },
      });
  }
  
onSort(event: any): void {
  if (this._router.url.includes('add')) {
    const field = event.field as keyof MatterPartyDto;
    const order = event.order; 

    if (!field) return;

    this.data = [...this.data].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return order === 1 ? -1 : 1;
      if (aVal > bVal) return order === 1 ? 1 : -1;
      return 0;
    });

    this.filterOptions.pageNum = 1;
    return;
  }
  this.filterOptions.orderBy = event.field;
  this.filterOptions.orderByDirection = event.order === 1 ? 'ASC' : 'DESC';
  this.filterOptions.pageNum = 1;
  this.getParties();
}

  openPartyEditor(rowData?: MatterPartyDto) {
    const ref = this._dialogService.open(MatterPartyEditorComponent, {
      header: rowData
        ? this._languageService.getTransValue('matters.updateParty')
        : this._languageService.getTransValue('matters.addParty'),
      data: { rowData, matterIdentifier: this.matterIdentifier },
    });
    ref.onClose.pipe(this._unsubscribe.takeUntilDestroy()).subscribe({
      next: (res: any) => {
        if (typeof res === 'object') {
          let index = this.data.findIndex((obj) => obj.id === res.id);
          if (index != -1) {
            this.data[index] = res;
          } else {
            this.data.push({ ...res, id: this.data.length + 1 });
          }
          this.totalRecords = this.data.length;
          this._matterService.updateMatter({
            ...this.formlyModel,
            law_MatterParties: this.data,
          });
        } else if (this.matterIdentifier) {
          this.getParties();
        }
      },
    });
  }
  onDelete(party: MatterPartyDto) {
    this.deleteDialogRef = this._dialogService.open(
      SharedConfirmDialogComponent,
      {
        modal: true,
        styleClass: 'w-[400px]',
        // width: '30vw',
        data: {
          type: ConfirmDialogType.Danger,
          title: this._languageService.getTransValue(
            'matters.deletePartyTitle',
            { value: party?.name },
          ),
          message: this._languageService.getTransValue(
            'matters.deletePartyMessage',
          ),
          btns: [
            {
              label: this._languageService.getTransValue('matters.discard'),
              //label: 'Discard',
              styleClass: 'border border-grey500 text-grey500',
              command: () => {
                this.deleteDialogRef.close();
              },
            },
            {
              label: this._languageService.getTransValue('matters.delete'),
              //label: 'Delete',
              styleClass: 'bg-textErrorBase text-white',
              command: () => {
                this.deleteParty(party);
              },
            },
          ],
        },
      },
    );
  }
  deleteParty(party: MatterPartyDto) {
    if (this._router.url.includes('add')) {
      this.data = this.data.filter((obj) => obj != party);
      this.totalRecords = this.data.length;

      this._matterService.updateMatter({
        ...this.formlyModel,
        law_MatterParties: this.data,
      });

      this._toastrNotifiService.displaySuccess('Party deleted successfully');

      this.deleteDialogRef.close();
      return;
    }

    this._apiService
      .post(API_Config.matterParties.delete, {}, { id: party.id })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess) {
            this._toastrNotifiService.displaySuccess(
              res.message || 'Party deleted successfully',
            );

            this.data.length == 1 ? this.filterOptions.pageNum-- : null;
            this.getParties();
            this.deleteDialogRef.close();
          } else {
            this._toastrNotifiService.displayError(
              res?.message || 'Failed to delete party',
            );
          }
        },

        error: () => {
          this._toastrNotifiService.displayError(
            'Something went wrong while deleting party',
          );
        },
      });
  }

  onPageChange(event: any): void {
    this.filterOptions.pagSize = Number(event.rows);
    this.filterOptions.pageNum = event.first / event.rows + 1;
    this.filterOptions = { ...this.filterOptions };
    this.getParties();
  }

  nextPage() {
    this._router.navigate(['../billing'], { relativeTo: this._route });
    this._matterService.updateRefreshCurrentTab(true);
  }
ngOnDestroy(): void {
  console.log('PARTIES SAVE', this.data);
  this._matterService.updateMatter({
    ...this.formlyModel,
    law_MatterParties: this.data,
  });
}
}
