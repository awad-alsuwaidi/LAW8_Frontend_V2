import {
  Component,
  effect,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { matterBillingEditorFieldsConfig } from './matter-billing-editor-formly.config';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { SharedModule } from 'src/app/@shared/shared.module';
import { MatterDetailsEditorComponent } from '../matter-editor/pages/matter-details-editor/matter-details-editor.component';
import { MatterBillingRateExceptionComponent } from './components/matter-billing-rate-exception/matter-billing-rate-exception.component';
import { MatterService } from '../../services/matter.service';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-matter-billing-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    SharedSkeletonGridComponent,
    SharedModule,
    CommonModule,
    MatterBillingRateExceptionComponent,
  ],
  providers: [MatterDetailsEditorComponent],
  templateUrl: './matter-billing-editor.component.html',
  styleUrl: './matter-billing-editor.component.scss',
})
export class MatterBillingEditorComponent
  extends FormBaseClass
  implements OnInit, OnDestroy
{
  matterDetailsEditorComponent = inject(MatterDetailsEditorComponent);
  @Input() set id(value: number) {
    this.matterIdentifier = value;
  }
  private originalModel: any;
  refreshData = effect(() => {
    if (this._matterService.getMatter()) {
      this.formlyModel = { ...this._matterService.getMatter() };
      console.log('this.formlyModel', this.formlyModel);
    }
  });
  matterIdentifier: any;
  _matterService = inject(MatterService);

  ngOnInit(): void {
    this.initForm().then(() => {
      if (this._router.url.includes('add')) this.editMode();
      else this.viewMode();

      if (this.matterIdentifier) {
        this.getMatterBillingById();
      }
    });
  }

  _permissionService = inject(PermissionService);

  hasPermission(permission: string): boolean {
    return this._permissionService.hasPermission(permission);
  }

  override async initForm() {
    this.formlyFields = await matterBillingEditorFieldsConfig(this);

    if (!this.formlyModel) this.formlyModel = {};

    this.loadLookups(() => {
      const mappings = [
        ['feesFrequencyId', 'frequency'],
        ['billingTemplatId', 'billingTemplate'],
        ['emailTemplatId', 'emailTemplate'],
        ['defaultTaskTypeId', 'taskCode'],
        ['defaultRateId', 'defaultRate'],
        ['feesTaskGroupId', 'taskGroup'],
        ['feesQuoteTypeId', 'quote'],
        ['disbursementId', 'disbursement'],
        ['typeId', 'type'],
      ];

      mappings.forEach(([fieldKey, lookupKey]) => {
        const field = this.findFieldByKey(fieldKey);
        if (!field) return;

        const lookupArr = this.getLookupArray(lookupKey as any);
        const labelKey = this.getLookupLabelKey(lookupKey as any);

        field.props.optionsArr = getOptionsArray(lookupArr, 'id', labelKey);
        field.props.loading = false;

        const selectedId = this.formlyModel?.[fieldKey];
        const selectedItem = lookupArr.find((x: any) => x.id == selectedId);

        if (selectedItem) {
          field.props.selectedObj = {
            label: selectedItem?.[labelKey],
            value: selectedItem.id,
          };
          field.formControl?.setValue(selectedItem.id, { emitEvent: false });
        }
      });
    });

    this.getFormValue();
  }
  private getLookupArray(lookupKey: keyof typeof this.lookupsData): any[] {
    const result = this.lookupsData?.[lookupKey]?.result;

    if (Array.isArray(result)) return result; // normal lookups
    if (Array.isArray(result?.dataList)) return result.dataList; // paged lookups (taskGroup)
    return [];
  }

  private getLookupLabelKey(lookupKey: keyof typeof this.lookupsData): string {
    if (lookupKey === 'taskGroup') return 'nameEn'; // أو nameAr حسب اللغة
    return 'name';
  }
  setSelectedValue(
    key: keyof typeof this.formlyModel,
    lookupKey: keyof typeof this.lookupsData,
  ): { label: string; value: number } | null {
    const selectedId = this.formlyModel?.[key];
    const lookupArr = this.getLookupArray(lookupKey);
    const labelKey = this.getLookupLabelKey(lookupKey);

    const selectedItem = lookupArr.find((item: any) => item.id == selectedId);
    if (!selectedItem) return null;

    return {
      label:
        selectedItem?.[labelKey] ??
        selectedItem?.nameEn ??
        selectedItem?.nameAr ??
        '',
      value: selectedItem.id,
    };
  }

  loadLookups(done?: () => void): void {
    this.isLoading = true;

    combineLatest({
      frequency: this._apiService.get(API_Config.general.getFrequency),
      billingTemplate: this._apiService.get(
        API_Config.general.getBillingTempletsList,
      ),
      emailTemplate: this._apiService.get(API_Config.general.getEmailTemplate),
      taskGroup: this._apiService.get(API_Config.general.gettaskCodesGroup, {
        pageNum: 1,
        pagSize: 100,
        orderByDirection: 'ASC',
      }),
      quote: this._apiService.get(API_Config.general.getQouteType),
      defaultRate: this._apiService.get(API_Config.general.getDefaultRate),
      taskCode: this._apiService.get(API_Config.general.getTaskCode),
      type: this._apiService.get(API_Config.general.getAllBillingType),
      disbursement: this._apiService.get(API_Config.general.getDisbursements),
    })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res) => {
          this.lookupsData = res;
          this.isLoading = false;

          if (done) done();
        },
        error: () => {
          this.isLoading = false;
          if (done) done();
        },
      });
  }

  getFormValue() {
    this.formly.valueChanges.subscribe({
      next: (value) => {
        this._matterService.updateMatter({
          ...this._matterService.getMatter(),
          ...this.formlyModel,
        });

        const selectFieldMap = [
          ['feesFrequencyId', 'frequency'],
          ['billingTemplatId', 'billingTemplate'],
          ['emailTemplatId', 'emailTemplate'],
          ['defaultTaskTypeId', 'taskCode'],
          ['defaultRateId', 'defaultRate'],
          ['feesTaskGroupId', 'taskGroup'],
          ['feesQuoteTypeId', 'quote'],
          ['disbursementId', 'disbursement'],
          ['typeId', 'type'],
        ] as const;

        selectFieldMap.forEach(([modelKey, lookupKey]) => {
          const field = findField(this.formlyFields, modelKey);
          if (field) {
            field.props['selectedObj'] = this.setSelectedValue(
              modelKey,
              lookupKey,
            );
          }
        });
        const radioFieldMap = [
          'discountTypeId',
          'isDiscountFees',
          'isBasedBilling',
          'billingTypeId',
        ];
        radioFieldMap.forEach((key) => {
          this.setRadioValue(key);
        });
      },
    });
  }

  private fetchLookup(api: string, key: string) {
    const field = this.findFieldByKey(key);

    if (!field?.props) return;

    field.props['loading'] = true;

    this._apiService
      .get(api)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          field.props['options'] = res.isSuccess
            ? getOptionsArray(res.result, 'id', 'name')
            : [];
        },
        error: () => {
          field.props['options'] = [];
        },
        complete: () => {
          field.props['loading'] = false;
        },
      });
  }

  private findFieldByKey(key: string) {
    return findField(this.formlyFields, key);
  }

  setRadioValue(key: string) {
    const field = findField(this.formlyFields, key);

    if (field) {
      const optionLabel = field.props.options.find(
        (option: any) => option.value === this.formlyModel[key],
      )?.label;
      field.props['optionLabel'] = optionLabel;
    }
  }

  editMode() {
    this.formlyOptions.formState = {
      readonly: false,
    };
  }
  //   viewMode() {
  //     this.formlyOptions.formState = {
  //       readonly: true,
  //     };
  //   }

  ///////////////////////////////////////////////////////

  // getMatterBillingById() {
  //   const matterId = this.matterIdentifier;

  //   this._apiService
  //     .post(`${API_Config.matterBilling.getById}?MatterId=${matterId}`, null)
  //     .pipe(this._unsubscribe.takeUntilDestroy())
  //     .subscribe({
  //       next: (res: any) => {
  //         if (res?.isSuccess && res.result) {
  //           this.formlyModel = { ...res.result };
  //           this.formly.setValue(this.formlyModel);
  //         }
  //       },
  //     });
  // }

  viewMode() {
    if (this.originalModel) {
      this.formlyModel = { ...this.originalModel };

      setTimeout(() => {
        this.formly.reset(this.originalModel, { emitEvent: false });
      });
    }

    this.formlyOptions.formState = {
      readonly: true,
    };
  }
  getMatterBillingById() {
    const matterId = this.matterIdentifier;

    this._apiService
      .post(`${API_Config.matterBilling.getById}?MatterId=${matterId}`, null)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          if (res?.isSuccess && res.result) {
            this.originalModel = { ...res.result }; // 🔥 مهم جدًا

            this.formlyModel = { ...res.result };

            setTimeout(() => {
              this.formly.setValue(this.formlyModel);
            });
          }
        },
      });
  }
  override onSubmit(): void {
    console.log('Submit Billing Settings');
    this.isLoading = true;

    if (this.formly.invalid) {
      const text = this._languageService.getTransValue(
        'common.pleaseFillRequiredData',
      );
      this._toastrNotifiService.displayError(text);
      this.isLoading = false;
      return;
    }

    const requestPayload = this.removeNullOrUndefinedValues({
      ...this.formlyModel,
      law_Matter_Id: this.matterIdentifier,
    });

    const pathApi = API_Config.matterBilling.update;

    this._apiService
      .post(pathApi, requestPayload)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          if (res?.isSuccess) {
            this._toastrNotifiService.displaySuccess(
              res?.message || 'Updated successfully',
            );
            this.viewMode();
            this.getMatterBillingById();
          } else {
            this._toastrNotifiService.displayError(
              res?.message || 'Update failed',
            );
          }
        },
        error: (err: any) => {
          this._toastrNotifiService.displayError(
            err?.error?.message || 'Unexpected error occurred',
          );
        },
      });
  }
  private removeNullOrUndefinedValues(obj: { [key: string]: any }): {
    [key: string]: any;
  } {
    const cleanedObj: { [key: string]: any } = {};
    Object.keys(obj).forEach((key) => {
      if (obj[key] !== null && obj[key] !== undefined) {
        cleanedObj[key] = obj[key];
      }
    });
    return cleanedObj;
  }
  generateChars() {
    const arr = [];
    for (let i = 0; i < 26; i++) {
      const char = String.fromCharCode(65 + i);
      arr.push({ value: char, label: char });
    }
    return arr;
  }
  ngOnDestroy(): void {
    this._matterService.updateMatter({
      ...this._matterService.getMatter(),
      ...this.formlyModel,
    });
  }
}
