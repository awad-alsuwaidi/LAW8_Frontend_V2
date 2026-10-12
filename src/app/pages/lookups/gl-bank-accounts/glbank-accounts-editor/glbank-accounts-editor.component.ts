import { Component, OnInit } from '@angular/core';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { glAccountEditorFields } from './gl-bank-accounts-editor.config';
import { FieldTypeConfig } from '@ngx-formly/core';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';

@Component({
  selector: 'app-glbank-accounts-editor',
  standalone: true,
  imports: [
    SharedModule,
    FormlyConfigModule,
    SharedButtonComponent,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './glbank-accounts-editor.component.html',
  styleUrl: './glbank-accounts-editor.component.scss',
})
export class GlbankAccountsEditorComponent
  extends FormBaseClass
  implements OnInit
{
  rowData: any;
  mode!: string;

  ngOnInit(): void {
    this.getLookupsData();
  }

  override getLookupsData(): void {
    this.isLoading = true;
    combineLatest({
      glType: this._apiService.get(API_Config.glAccountTypes.get),
      department: this._apiService.get(API_Config.departments.get),
      category: this._apiService.get(API_Config.glAccountCategories.get),
      costCenter: this._apiService.get(API_Config.costCenters.get),
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: any) => {
          const pick = (r: any) =>
            r?.data?.items ??
            r?.result?.items ??
            r?.result?.dataList ??
            r?.result ??
            r?.data ??
            [];

          this.lookupsData = {
            glType: pick(res.glType),
            department: pick(res.department),
            category: pick(res.category),
            costCenter: pick(res.costCenter),
          };

          this.initForm();
        },
      });
  }

  override initForm(): void {
    if (this._dynamicDialogConfig?.data?.rowData) {
      this.setFormData();
    } else {
      this.formlyFields = glAccountEditorFields(this);
      this.formlyModel = {
        accountName: '',
        nickName: '',
        categoryId: null,
        costCenterId: null,
        control: '',
        subAccountOfId: null,
        glAccountTypeId: null,
        departmentId: null,
        isActive: true,
      };
    }
  }

  setFormData(): void {
    this.rowData = this._dynamicDialogConfig.data.rowData;
    this.mode = this._dynamicDialogConfig.data.mode;

    this.formlyOptions.formState = {
      readonly: this.mode === 'view',
    };

    const d = this.rowData;
    this.formlyModel = {
      id: d.id,
      accountName: d.accountName ?? '',
      nickName: d.nickName ?? '',
      categoryId: d.categoryId ?? null,
      costCenterId: d.costCenterId ?? null,
      control: d.control ?? '',
      subAccountOfId: d.subAccountOfId ?? null,
      glAccountTypeId: d.glAccountTypeId ?? d.typeId ?? null,
      departmentId: d.departmentId ?? null,
      isActive: d.isActive ?? d.active ?? true,
    };

    this.formlyFields = glAccountEditorFields(this);
    this.formly.patchValue(this.formlyModel);

    const typeField: FieldTypeConfig = findField(this.formlyFields, 'glAccountTypeId');
    const deptField: FieldTypeConfig = findField(this.formlyFields, 'departmentId');
    const catField: FieldTypeConfig = findField(this.formlyFields, 'categoryId');
    const ccField: FieldTypeConfig = findField(this.formlyFields, 'costCenterId');

    if (this.formlyModel.glAccountTypeId && typeField) {
      typeField.props['selectedObj'] = this.setSelected(
        this.lookupsData.glType,
        this.formlyModel.glAccountTypeId
      );
    }
    if (this.formlyModel.departmentId && deptField) {
      deptField.props['selectedObj'] = this.setSelected(
        this.lookupsData.department,
        this.formlyModel.departmentId
      );
    }
    if (this.formlyModel.categoryId && catField) {
      catField.props['selectedObj'] = this.setSelected(
        this.lookupsData.category,
        this.formlyModel.categoryId
      );
    }
    if (this.formlyModel.costCenterId && ccField) {
      ccField.props['selectedObj'] = this.setSelected(
        this.lookupsData.costCenter,
        this.formlyModel.costCenterId
      );
    }
  }

  setSelected(list: any[], id: any) {
    const item = list.find((obj) => obj.id == id);
    if (!item) return null;
    const nameKey =
      this._languageService.getSelectedLanguage() === 'en' ? 'nameEn' : 'nameAr';
    return { label: item[nameKey] ?? item.name ?? '', value: item.id };
  }

  onEdit() {
    this.formlyOptions.formState.readonly = false;
  }

  override onSubmit(): void {
    if (this.formly.invalid) {
      const text = this._languageService.getTransValue(
        'Check Data Validation'
      );
      this._toastrNotifiService.displayError(text);
      this.formly.markAllAsTouched();
      return;
    }

    const isUpdate = !!this.rowData;
    const successMsgKey = isUpdate
      ? 'messages.updateSuccessfully'
      : 'messages.createdSuccessfully';

    // ★ Payload الجديد
    const requestPayload = {
      accountName: this.formlyModel.accountName ?? '',
      nickName: this.formlyModel.nickName ?? '',
      categoryId: this.formlyModel.categoryId ? +this.formlyModel.categoryId : null,
      costCenterId: this.formlyModel.costCenterId ? +this.formlyModel.costCenterId : null,
      control: this.formlyModel.control ?? '',
      subAccountOfId: this.formlyModel.subAccountOfId
        ? +this.formlyModel.subAccountOfId
        : null,
      glAccountTypeId: this.formlyModel.glAccountTypeId
        ? +this.formlyModel.glAccountTypeId
        : null,
      departmentId: this.formlyModel.departmentId
        ? +this.formlyModel.departmentId
        : null,
      isActive: this.formlyModel.isActive ?? true,
    };

    const request$ = isUpdate
      ? this._apiService.put(
          `${API_Config.glAccounts.update}/${this.rowData.id}`,
          requestPayload
        )
      : this._apiService.post(API_Config.glAccounts.create, requestPayload);

    this.isSubmitted = true;

    request$
      .pipe(
        finalize(() => (this.isSubmitted = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: any) => {
          if (res?.isSuccess || res?.success) {
            const text = this._languageService.getTransValue(successMsgKey);
            this._toastrNotifiService.displaySuccess(text);
            this._dynamicDialogRef.close(true);
          } else {
            this._toastrNotifiService.displayError(res?.message);
          }
        },
        error: (err: any) => {
          this._toastrNotifiService.displayError(err?.error?.message);
        },
      });
  }
}