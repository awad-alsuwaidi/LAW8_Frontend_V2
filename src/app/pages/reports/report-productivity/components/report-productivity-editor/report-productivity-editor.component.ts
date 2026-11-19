import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { reportProductivityFilterEditorConfig } from './report-productivity-filter-editor.config';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-report-productivity-editor',
  standalone: true,
  imports: [
    FormlyConfigModule,
    SharedButtonComponent,
    SharedModule,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './report-productivity-editor.component.html',
  styleUrl: './report-productivity-editor.component.scss',
})
export class ReportProductivityEditorComponent
  extends FormBaseClass
  implements OnInit, OnDestroy
{
  private _http = inject(HttpClient);

  ngOnInit(): void {
    this.initForm();
    this.getLookupsData();
  }

  override getLookupsData(): void {
    this.loadBulkLookups();
    this.loadLawyers();
  }

  private loadBulkLookups(): void {
    const types = ['branches', 'departments'].join(',');

    this._apiService
      .get(API_Config.general.getLookups, { types })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const d = res?.data ?? res?.result ?? res ?? {};
          this.updateFieldOptions('branchIds', d.branches ?? []);
          this.updateFieldOptions('departmentIds', d.departments ?? []);
        },
        error: (err) => console.error('Bulk lookups failed:', err),
      });
  }

  private loadLawyers(): void {
    this._apiService
      .get(API_Config.general.getUsersLookupForReports)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const raw = res?.data ?? res?.result ?? res ?? [];
          const list = Array.isArray(raw)
            ? raw
            : (raw.items ?? raw.dataList ?? []);

          const normalized = list.map((u: any) => ({
            id: u.id ?? u.userId ?? u.Id ?? u.UserId ?? u.userGuid ?? u.guid,
            nameEn:
              u.nameEn ??
              u.userName ??
              u.fullName ??
              u.displayName ??
              u.name ??
              '',
            nameAr:
              u.nameAr ??
              u.nameArabic ??
              u.arabicName ??
              u.fullName ??
              u.name ??
              '',
          }));

          const valid = normalized.filter((u: any) => u.id != null);

          this.updateFieldOptions('lawyerIds', valid);
        },
      });
  }

  private updateFieldOptions(fieldKey: string, result: any): void {
    const field = findField(this.formlyFields, fieldKey);
    if (!field || !field.props) return;

    const list: any[] = Array.isArray(result) ? result : [];
    if (list.length === 0) {
      field.props = { ...field.props, optionsArr: [], loading: false };
      return;
    }

    const lang = this._languageService.getSelectedLanguage();
    const hasLocalizedName = list[0].nameEn != null || list[0].nameAr != null;

    const optionsArr = hasLocalizedName
      ? list.map((item) => ({
          label:
            lang === 'ar'
              ? (item.nameAr ?? item.nameEn ?? item.name ?? '')
              : (item.nameEn ?? item.nameAr ?? item.name ?? ''),
          value: item.id,
        }))
      : getOptionsArray(list, 'id', 'name');

    field.props = { ...field.props, optionsArr, loading: false };
  }

  initForm(): void {
    this.formlyFields = reportProductivityFilterEditorConfig(this);
  }

  reset() {
    this.formly.reset();
    this.formlyModel = {};
  }

  onSubmit(): void {
    this.isLoading = true;

    const q: any = this.formlyModel ?? {};
    let params = new HttpParams();

    if (q.dateFrom)
      params = params.set('dateFrom', this.formatDate(q.dateFrom));
    if (q.dateTo) params = params.set('dateTo', this.formatDate(q.dateTo));

    params = this.appendMulti(params, 'branchIds', q.branchIds);
    params = this.appendMulti(params, 'departmentIds', q.departmentIds);
    params = this.appendMulti(params, 'lawyerIds', q.lawyerIds);

    params = params.set('format', q.format ?? 'pdf');
    params = params.set('lang', q.lang ?? 'en');

    const url = `${environment.apiUrl}/${API_Config.productivityReport.export}`;
    const ext = q.format === 'xlsx' ? 'xlsx' : 'pdf';

    this._http
      .get(url, { params, responseType: 'blob' })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (blob: Blob) => {
          const objectUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = objectUrl;
          a.download = `productivity-report.${ext}`;
          a.click();
          URL.revokeObjectURL(objectUrl);
        },
        error: (err) => console.error('Export failed:', err),
      });
  }

  private appendMulti(
    params: HttpParams,
    key: string,
    values: any,
  ): HttpParams {
    if (Array.isArray(values)) {
      const clean = values.filter(
        (v) =>
          v != null &&
          v !== '' &&
          String(v).trim() !== '' &&
          String(v) !== 'undefined',
      );
      if (clean.length === 0) return params;
      return clean.reduce((p, v) => p.append(key, String(v)), params);
    }
    if (values != null && values !== '' && String(values) !== 'undefined') {
      return params.append(key, String(values));
    }
    return params;
  }

  private formatDate(value: any): string {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
