import { Component, inject, OnInit } from '@angular/core';
import { FieldTypeConfig } from '@ngx-formly/core';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { bankAccountEditorFields } from './lookups-bank-accounts-editor.config';
import { SharedButtonComponent } from '../../../../@shared/components/shared-button/shared-button.component';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';

@Component({
  selector: 'app-bank-accounts-editor',
  standalone: true,
  imports: [
    SharedModule,
    FormlyConfigModule,
    SharedButtonComponent,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './bank-accounts-editor.component.html',
  styleUrl: './bank-accounts-editor.component.scss',
})
export class BankAccountsEditorComponent extends FormBaseClass implements OnInit {
  mode!: string;

  ngOnInit(): void {
    this.getLookupsData();
  }

  override getLookupsData(): void {
    this.isLoading = true;
    combineLatest({
      bankType: this._apiService.get(API_Config.bankAccountTypes.get),  // ★
      glAccount: this._apiService.get(API_Config.glAccounts.get),        // ★
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: any) => {
          // ★ يقبل {data: {items}} أو {result: {dataList}} أو array مباشرة
          this.lookupsData = {
            bankType: res.bankType?.data?.items
              ?? res.bankType?.result?.items
              ?? res.bankType?.result?.dataList
              ?? res.bankType?.result
              ?? [],
            glAccount: res.glAccount?.data?.items
              ?? res.glAccount?.result?.items
              ?? res.glAccount?.result?.dataList
              ?? res.glAccount?.result
              ?? [],
          };

          this.initForm();
        },
      });
  }

  override initForm(): void {
    if (this._dynamicDialogConfig?.data?.rowData) {
      this.setFormData();
    } else {
      this.formlyFields = bankAccountEditorFields(this);
      this.formlyModel = {
        bankName: '',
        bankAccountTypeId: null,
        accountName: '',
        accountNo: '',
        address: '',
        swiftCode: '',
        iban: '',
        branchName: '',
        accountHolder: '',
        glAccountId: null,
        isActive: true,
      };
    }
  }

  setFormData(): void {
    this.mode = this._dynamicDialogConfig.data.mode;
    this.formlyOptions.formState = {
      readonly: this.mode === 'view',
    };

    const data = this._dynamicDialogConfig.data.rowData;

    this.formlyModel = {
      id: data.id,
      bankName: data.bankName ?? data.bankId ?? '',
      bankAccountTypeId: data.bankAccountTypeId ?? data.bankTypeId ?? null,
      accountName: data.accountName ?? '',
      accountNo: data.accountNo ?? '',
      address: data.address ?? '',
      swiftCode: data.swiftCode ?? '',
      iban: data.iban ?? '',
      branchName: data.branchName ?? '',
      accountHolder: data.accountHolder ?? '',
      glAccountId: data.glAccountId ?? null,
      isActive: data.isActive ?? data.active ?? true,
    };

    this.formlyFields = bankAccountEditorFields(this);
    this.formly.patchValue(this.formlyModel);

    const bankTypeField: FieldTypeConfig = findField(this.formlyFields, 'bankAccountTypeId');
    const glAccountField: FieldTypeConfig = findField(this.formlyFields, 'glAccountId');

    if (this.formlyModel?.bankAccountTypeId && bankTypeField) {
      bankTypeField.props['selectedObj'] = this.setBankTypeValue();
    }
    if (this.formlyModel?.glAccountId && glAccountField) {
      glAccountField.props['selectedObj'] = this.setGlAccountValue();
    }
  }

  onEdit() {
    this.formlyOptions.formState.readonly = false;
  }

  setBankTypeValue() {
    const selected = this.lookupsData?.bankType?.find(
      (obj: any) => obj.id == this.formlyModel?.bankAccountTypeId
    );
    if (!selected) return null;
    const nameKey =
      this._languageService.getSelectedLanguage() === 'en' ? 'nameEn' : 'nameAr';
    return {
      label: selected[nameKey] ?? selected.name ?? '',
      value: selected.id,
    };
  }

  setGlAccountValue() {
    const selected = this.lookupsData?.glAccount?.find(
      (obj: any) => obj.id == this.formlyModel?.glAccountId
    );
    if (!selected) return null;
    const nameKey =
      this._languageService.getSelectedLanguage() === 'en' ? 'nameEn' : 'nameAr';
    return {
      label: selected[nameKey] ?? selected.name ?? '',
      value: selected.id,
    };
  }

  override onSubmit(): void {
    if (this.formly.invalid) {
      const text = this._languageService.getTransValue('messages.checkDataValidation');
      this._toastrNotifiService.displayError(text);
      this.formly.markAllAsTouched();
      return;
    }

    const isUpdate = !!this._dynamicDialogConfig?.data?.rowData;
    const successMsgKey = isUpdate
      ? 'messages.updateSuccessfully'
      : 'messages.createdSuccessfully';

    const requestPayload = {
      bankName: this.formlyModel.bankName ?? '',
      bankAccountTypeId: +this.formlyModel.bankAccountTypeId,
      accountName: this.formlyModel.accountName ?? '',
      accountNo: this.formlyModel.accountNo ?? '',
      address: this.formlyModel.address ?? '',
      swiftCode: this.formlyModel.swiftCode ?? '',
      iban: this.formlyModel.iban ?? '',
      branchName: this.formlyModel.branchName ?? '',
      accountHolder: this.formlyModel.accountHolder ?? '',
      glAccountId: this.formlyModel.glAccountId
        ? +this.formlyModel.glAccountId
        : null,
      isActive: this.formlyModel.isActive ?? true,
    };

    const request$ = isUpdate
      ? this._apiService.put(
          `${API_Config.bankAccounts.update}/${this._dynamicDialogConfig.data.rowData.id}`,
          requestPayload
        )
      : this._apiService.post(API_Config.bankAccounts.create, requestPayload);

    this.isSubmitted = true;

    request$
      .pipe(
        finalize(() => (this.isSubmitted = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: any) => {
          if (res && (res.isSuccess || res.success)) {
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