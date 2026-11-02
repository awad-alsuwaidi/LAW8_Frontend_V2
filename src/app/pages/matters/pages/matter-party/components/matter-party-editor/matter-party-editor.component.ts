import { Component, inject, OnInit } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { matterPartyEditorFieldsConfig } from './matter-party-editor-formly.config';
import { SharedModule } from 'src/app/@shared/shared.module';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-matter-party-editor',
  standalone: true,
  imports: [SharedModule, FormlyConfigModule, SharedButtonComponent],
  templateUrl: './matter-party-editor.component.html',
  styleUrl: './matter-party-editor.component.scss',
})
export class MatterPartyEditorComponent
  extends FormBaseClass
  implements OnInit
{
  matterIdentifier: any;
  isSaveAndNew!: boolean;
  ngOnInit(): void {
    this.getLookupsData();
  }
  override initForm(): void {
    this.formlyFields = matterPartyEditorFieldsConfig(this);
    this.setFormData();
  }

  override getLookupsData() {
    this.isLoading = true;

    this._apiService
      .get(API_Config.general.getLookups, {
        types: ['partyTypes', 'partyDescriptions'],
      })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          const data = res?.data ?? res?.result ?? res ?? {};

          const mapName = (list: any) => {
            if (!Array.isArray(list)) return [];
            return list.map((x: any) => ({
              ...x,
              name: x.name || x.nameEn || x.nameAr || '',
            }));
          };
          this.lookupsData = {
            partyType: { result: mapName(data.partyTypes) },
            partyDescription: { result: mapName(data.partyDescriptions) },
          };

          this.initForm();
        },
        error: (err) => {
          console.error('[MatterPartyEditor] lookups failed', err);
          this.isLoading = false;
          this.lookupsData = {
            partyType: { result: [] },
            partyDescription: { result: [] },
          };
          this.initForm();
        },
      });
  }
  setFormData() {
    const row = this._dynamicDialogConfig.data.rowData;
    this.matterIdentifier = this._dynamicDialogConfig.data.matterIdentifier;

    if (row) {
      this.formlyModel = {
        ...row,
        partyTypeId: row.partyTypeId,
        partyType: row.partyTypeName ?? row.partyType ?? '',
        partyDescriptionId:
          row.partyDescriptionId ?? row.law_PartiesDescriptionId,
        partyDescription:
          row.partyDescriptionName ??
          row.law_PartiesDescription ??
          row.partyDescription ??
          '',
      };
      if (this.formlyModel.partyDescriptionId) {
        this.getPositionByDescriptionId(this.formlyModel.partyDescriptionId);
      }
    } else {
      this.formlyModel = {};
    }
  }
  private extractList(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;

    const d = res.data ?? res.result ?? res;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.items)) return d.items;
    if (Array.isArray(d?.dataList)) return d.dataList;

    return [];
  }

  getPositionByDescriptionId(descriptionId: any) {
    if (!descriptionId) return;
    const param: any = {
      partyDescriptionId: descriptionId,
    };
    if (this.matterIdentifier != null && this.matterIdentifier !== undefined) {
      param.matterId = this.matterIdentifier;
    }
    if (this._dynamicDialogConfig.data.rowData?.id) {
      param.excludePartyId = this._dynamicDialogConfig.data.rowData.id;
    }
    Object.keys(param).forEach((key) => {
      if (param[key] === undefined || param[key] === null) {
        delete param[key];
      }
    });

    this._apiService
      .get(API_Config.matterParties.availablePositions, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const list = this.extractList(res);
          const positionField: FormlyFieldConfig = findField(
            this.formlyFields,
            'position',
          );
          if (positionField?.props) {
            positionField.props['optionsArr'] = list.map((obj: any) => ({
              label: obj.name ?? obj.nameEn ?? String(obj),
              value: obj.id ?? obj,
            }));

            if (this._dynamicDialogConfig.data.rowData) {
              const current = this.formlyModel?.position;
              if (
                current != null &&
                !positionField.props['optionsArr'].some(
                  (o: any) => o.value === current,
                )
              ) {
                positionField.props['optionsArr'].push({
                  value: current,
                  label: current.toString(),
                });
              }
            }
          }
          this.formlyModel = { ...this.formlyModel };
        },
        error: (err) => {
          console.error('[available-positions] failed', err);
          const positionField: FormlyFieldConfig = findField(
            this.formlyFields,
            'position',
          );
          if (positionField?.props) positionField.props['optionsArr'] = [];
        },
      });
  }

  saveAndNew() {
    this.isSaveAndNew = true;
    this.onSubmit();
  }
  reset() {
    this.formlyModel = {};
    this.formly.reset();
  }
  override onSubmit(): void {
    if (this.formly.invalid) return;
    this.isLoading = true;

    if (this._router.url.includes('add')) {
      this._dynamicDialogRef.close({
        ...this.formlyModel,
        partyDescriptionId: this.formlyModel.partyDescriptionId,
      });
      return;
    }

    const isEdit = !!this._dynamicDialogConfig?.data?.rowData;

    const requestPayload = {
      partyTypeId: this.formlyModel.partyTypeId,
      partyDescriptionId: this.formlyModel.partyDescriptionId,
      position: this.formlyModel.position,
      name: this.formlyModel.name,
      matterId: this.matterIdentifier,
    };
    const path = isEdit
      ? `${API_Config.matterParties.update}/${this._dynamicDialogConfig.data.rowData.id}`
      : API_Config.matterParties.create;

    const request$ = isEdit
      ? this._apiService.put(path, requestPayload)
      : this._apiService.post(path, requestPayload);

    request$
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess) {
            this._toastrNotifiService.displaySuccess(res?.message);
            this.reset();
            if (!this.isSaveAndNew) this._dynamicDialogRef.close(true);
            this.isSaveAndNew = false;
          } else {
            this._toastrNotifiService.displayError(res?.message);
          }
        },
        error: (err: any) => {
          this._toastrNotifiService.displayError(
            err?.error?.message || 'Something went wrong',
          );
        },
      });
  }
}
