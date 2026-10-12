import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FieldTypeConfig } from '@ngx-formly/core';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { lookupsPredefinedTasksEditorConfig } from './lookups-task-groups-editor.config';
import { SharedBreadcrumbComponent } from 'src/app/@shared/components/shared-breadcrumb/shared-breadcrumb.component';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { TaskGroupDetailsDto } from '../interfaces/lookups-task-groups.interface';

@Component({
  selector: 'app-lookups-task-groups-editor',
  standalone: true,
  imports: [
    SharedButtonComponent,
    FormlyConfigModule,
    SharedModule,
    SharedBreadcrumbComponent,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './lookups-task-groups-editor.component.html',
  styleUrl: './lookups-task-groups-editor.component.scss',
})
export class LookupsTaskGroupsEditorComponent
  extends FormBaseClass
  implements OnInit, OnDestroy
{
  @Input() set id(value: number) {
    this.taskIdentifier = value;
  }
  taskIdentifier: any;

  ngOnInit(): void {
    this.getLookupsData();
  }

  // ★ استخدمها في الـ HTML عشان تعرض الاسم
getTaskLabel(item: any): string {
  if (item == null) return '';

  // لو object وفيه label جاهز → استخدمه
  if (typeof item === 'object' && item.label) return item.label;

  // استخرج الـ id
  const id =
    typeof item === 'object'
      ? item.value ?? item.taskId ?? item.id
      : item;

  const nameKey =
    this._languageService.getSelectedLanguage() === 'en'
      ? 'nameEn'
      : 'nameAr';

  // ابحث في الـ lookups
  const found = (this.lookupsData?.predefinedTasks ?? []).find(
    (x: any) => x.id == id
  );

  if (found) {
    return (
      found[nameKey] ??
      found.nameEn ??
      found.nameAr ??
      found.name ??
      `#${id}`
    );
  }

  // لو object فيه أسماء من الباك
  if (typeof item === 'object') {
    return (
      item.taskNameEn ??
      item.taskNameAr ??
      item.taskDescription ??
      `#${id}`
    );
  }

  return `#${id}`;
}

// ★ استخدمها للـ routeLink
getIdValue(item: any): any {
  if (item == null) return null;
  if (typeof item === 'object') return item.value ?? item.taskId ?? item.id;
  return item;
}

override getLookupsData(): void {
  this.isLoading = true;
  combineLatest({
    department: this._apiService.get(API_Config.departments.get),
    predefinedTasks: this._apiService.get(API_Config.predefinedTasks.get),
  })
    .pipe(
      finalize(() => (this.isLoading = false)),
      this._unsubscribe.takeUntilDestroy()
    )
    .subscribe({
      next: (res: any) => {
        console.log('🔍 raw department:', res.department);
        console.log('🔍 raw predefinedTasks:', res.predefinedTasks);

        const pick = (r: any) =>
          r?.data?.items ??
          r?.result?.items ??
          r?.result?.dataList ??
          r?.result ??
          r?.data ??
          [];

        this.lookupsData = {
          department: pick(res.department),
          predefinedTasks: pick(res.predefinedTasks),
        };

        console.log('✅ department count:', this.lookupsData.department.length);
        console.log('✅ predefinedTasks count:', this.lookupsData.predefinedTasks.length);
        console.log('✅ first predefinedTask:', this.lookupsData.predefinedTasks[0]);

        this.initForm();
        this.setFormMode(this._router.url.includes('view'));
        if (this.taskIdentifier) this.setFormData();
      },
    });
}

  override initForm(): void {
    this.formlyFields = lookupsPredefinedTasksEditorConfig(this);
  }

  setFormMode(readonly: boolean) {
    this.formlyOptions.formState = { readonly };
  }

  onEdit() {
    this._router.navigate(['/lookups/task-groups/update', this.taskIdentifier]);
  }

setDepartmentValue() {
  const nameKey =
    this._languageService.getSelectedLanguage() === 'en' ? 'nameEn' : 'nameAr';

  const selectedDepartment = this.lookupsData?.department?.find(
    (obj: any) => obj.id == this.formlyModel?.departmentId
  );
  if (!selectedDepartment) return null;
  return {
    label: selectedDepartment[nameKey] ?? selectedDepartment.name ?? '',
    value: selectedDepartment.id,
  };
}

deleteTask(task: any) {
  const targetId = this.getIdValue(task);       
  this.formlyModel.taskIds = (this.formlyModel.taskIds || []).filter(
    (obj: any) => this.getIdValue(obj) != targetId    
  );
  this.formlyModel = { ...this.formlyModel };
}

setFormData(): void {
  this._apiService
    .get(`${API_Config.taskGroups.getById}/${this.taskIdentifier}`)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res: any) => {
        const data = res?.data ?? res?.result ?? res;
        this.initForm();
        const rawItems: any[] = data.items ?? data.taskIds ?? [];

        const taskIds: number[] = rawItems
          .map((t: any) => {
            if (typeof t === 'object') return t.taskId ?? t.id ?? t.value;
            return t;
          })
          .filter((v: any) => v != null);

        this.formlyModel = {
          nameEn: data.nameEn,
          nameAr: data.nameAr,
          isActive: data.isActive,
          departmentId: data.departmentId,
          taskIds,                              
        };

        const departmentField = findField(this.formlyFields, 'departmentId');
        if (this.formlyModel?.departmentId && departmentField) {
          departmentField.props['selectedObj'] = this.setDepartmentValue();
        }

        const tasksField = findField(this.formlyFields, 'taskIds');
        if (tasksField && rawItems.length) {
          const nameKey =
            this._languageService.getSelectedLanguage() === 'en'
              ? 'taskNameEn'
              : 'taskNameAr';

          tasksField.props['selectedObj'] = rawItems.map((t: any) => {
            if (typeof t === 'object') {
              return {
                label:
                  t[nameKey] ??
                  t.taskNameEn ??
                  t.taskNameAr ??
                  `#${t.taskId ?? t.id}`,
                value: t.taskId ?? t.id,
              };
            }
            const found = (this.lookupsData?.predefinedTasks ?? []).find(
              (x: any) => x.id == t
            );
            const nameKey2 =
              this._languageService.getSelectedLanguage() === 'en'
                ? 'nameEn'
                : 'nameAr';
            return {
              label: found
                ? found[nameKey2] ?? `#${t}`
                : `#${t}`,
              value: t,
            };
          });
        }

        this.formlyModel = { ...this.formlyModel };

        console.log('👤 taskIds:', this.formlyModel.taskIds);
        console.log('👤 selectedObj:', tasksField?.props?.['selectedObj']);
      },
      error: (err) => console.error('❌ setFormData:', err),
    });
}


override onSubmit(): void {
  // ★ يقبل [1,2,3] أو [{label,value}]
  const taskIds: number[] = (this.formlyModel.taskIds || [])
    .map((item: any) => {
      if (item && typeof item === 'object') return item.value ?? item.taskId ?? item.id;
      return item;
    })
    .filter((v: any) => v != null && v !== '');

  console.log('📤 taskIds sent:', taskIds);

  const basePayload = {
    nameEn: this.formlyModel.nameEn,
    nameAr: this.formlyModel.nameAr,
    isActive: this.formlyModel.isActive ?? true,
    departmentId: this.formlyModel.departmentId,
    taskIds,                                    // ★ الاسم الصح للـ payload
  };

  this.isSubmitted = true;

  const request$ = this.taskIdentifier
    ? this._apiService.put(
        `${API_Config.taskGroups.update}/${this.taskIdentifier}`,
        basePayload
      )
    : this._apiService.post(API_Config.taskGroups.create, basePayload);

  request$
    .pipe(
      finalize(() => (this.isSubmitted = false)),
      this._unsubscribe.takeUntilDestroy()
    )
    .subscribe({
      next: (res: ApiRes) => {
        if (res && res.isSuccess) {
          this._toastrNotifiService.displaySuccess(res?.message);
          this._dynamicDialogRef?.close(true);
          this._router.navigate(['/lookups/task-groups']);
        } else {
          this._toastrNotifiService.displayError(res?.message);
        }
      },
      error: (err: any) => {
        this._toastrNotifiService.displayError(err?.error?.message);
      },
    });
}

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}