import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { tmSessionAdditionalFilterFields } from './tm-session-filter-additional-editor.config';

@Component({
  selector: 'app-tm-session-filter-additional-editor',
  standalone: true,
  imports: [FormlyConfigModule, SharedButtonComponent, TranslateModule],
  templateUrl: './tm-session-filter-additional-editor.component.html',
  styleUrls: ['./tm-session-filter-additional-editor.component.scss'],
})
export class TmSessionFilterAdditionalEditorComponent
  extends FormBaseClass
  implements OnInit
{
  override isLoading = true;

  ngOnInit(): void {
    this.getLookupsData();
  }

  override getLookupsData(): void {
    this.isLoading = true;

    this._apiService
      .get(API_Config.general.getBatchLookups, {
        'types[0]': 'activityStatuses',
        'types[1]': 'taskPriorities',
        'types[2]': 'activityTypes',
        'types[3]': 'users',
        PageSize: 1000,
      })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const data = res?.data ?? res?.result ?? res;

          const extractList = (obj: any): any[] => {
            if (!obj) return [];
            if (Array.isArray(obj)) return obj;
            return obj.items ?? obj.dataList ?? [];
          };
          const statuses = extractList(data.activityStatuses).map((s: any) => ({
            ...s,
            name: s.nameEn || s.nameAr || '---',
          }));

          const priorities = extractList(data.taskPriorities).map((p: any) => ({
            ...p,
            name: p.nameEn || p.nameAr || '---',
          }));

          let activityTypes = extractList(data.activityTypes).map((a: any) => ({
            ...a,
            name: a.nameEn || a.nameAr || '---',
          }));

          const users = extractList(data.users).map((u: any) => ({
            ...u,
            name: u.name || u.nameEn || '---',
          }));

          if (this._router.url.includes('activity')) {
            activityTypes = activityTypes.filter(
              (obj: any) => obj.id !== 1 && obj.id !== 2,
            );
          }

          this.lookupsData = {
            status: { result: statuses },
            taskPriority: { result: priorities },
            activityType: { result: activityTypes },
            user: { result: users },
          };

          this.initForm();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Lookups Error:', err);
          this.isLoading = false;
        },
      });
  }

  override initForm(): void {
    this.formlyFields = tmSessionAdditionalFilterFields(this);
    this.setForm();
  }

  private setForm(): void {
    this.formlyModel = { ...this._dynamicDialogConfig.data.formlyModel };
  }

  reset(): void {
    this.formlyModel = {};
    this.formly.reset();
    this.initForm();
  }

  onSubmit(): void {
    this._dynamicDialogRef.close(this.formly.value);
  }
}
