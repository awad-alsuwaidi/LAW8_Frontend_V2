import { Component, inject, OnInit } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { lookupsSubMatterListEditorConfig } from './lookups-sub-matter-list-editor.config';
import { finalize } from 'rxjs';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Lookups_API } from 'src/app/@core/api/api-config/lookups';

@Component({
  selector: 'app-lookups-sub-matter-list-editor',
  standalone: true,
  imports: [SharedButtonComponent, FormlyConfigModule, TranslateModule],
  templateUrl: './lookups-sub-matter-list-editor.component.html',
  styleUrl: './lookups-sub-matter-list-editor.component.scss',
})
export class LookupsSubMatterListEditorComponent extends FormBaseClass implements OnInit{
  rowData: any;
  private router = inject(Router);
  showIsLitigation = false;
  groupId!: number;
  taskCodeGroups: any[] = [];

ngOnInit(): void {
  this.groupId = Number(this._router.url.split('/').pop());
  this.showIsLitigation = this.groupId === 8;

  // ★ لو Task Codes، حمّل الـ groups الأول
  if (this.groupId === 7) {
    this.loadTaskCodeGroups();
    // initForm بتتنادى من جوه loadTaskCodeGroups
  } else {
    // ★ باقي الأنواع — عادي
    this.initForm();
  }
}

override initForm(): void {
  // ★ عيّن rowData الأول قبل ما تبني الـ config
  this.rowData = this._dynamicDialogConfig.data.rowData;

  // ★ بعدها ابني الـ fields (عشان defaultValue في الـ config يشوف rowData)
  this.formlyFields = lookupsSubMatterListEditorConfig(this);

  if (this.rowData) {
    this.formlyModel = {
      ...this.rowData,
      // ★★★ mapping الأساسي للـ Active
      active: this.rowData.isActive ?? this.rowData.active ?? true,
    };

    if (this.groupId === 7) {
      this.formlyModel.groupId = Number(
        this.rowData.taskCodeGroupId ?? this.rowData.groupId
      );
      this.formlyModel.isBillable = this.rowData.isBillable ?? false;
    }

    if (this.groupId === 13 && this.rowData.nameEn) {
      this.formlyModel.nameEn = this.rowData.nameEn;
    }
  }

  console.log('📋 initForm → formlyModel:', this.formlyModel);
  console.log('📋 initForm → rowData:', this.rowData);
}
// loadTaskCodeGroups() {
//   this._apiService
//     .get('Law_TaskCodesGroup/GetList', {
//       pageNum: 1,
//       pagSize: 1000,
//       orderByDirection: 'ASC',
//     })
//     .pipe(this._unsubscribe.takeUntilDestroy())
//     .subscribe((res: ApiRes) => {
//       const list = res?.result?.dataList || [];

//       this.taskCodeGroups = list.map((item: any) => ({
//         label: item.nameEn_Ar,   // ✅ النظام الجديد
//         value: item.id,
//       }));

//       // ✅ باتش القيمة بالـ id مش بالاسم
//       if (this.rowData?.groupId) {
//         this.formlyModel = {
//           ...this.formlyModel,
//           groupId: this.rowData.groupId,
//         };
//       }

//       this.initForm();
//     });
// }


loadTaskCodeGroups(): void {
  const url = Lookups_API.taskCodesGroups.get;

  this._apiService
    .get<any>(url, {
      pageNumber: 1,
      pageSize: 1000,           // ★ pageSize مش pagSize
      sortBy: 'id',
      isDescending: false,
    })
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res: any) => {
        const body = res?.data ?? res?.result ?? res;
        const list = body?.items ?? body?.dataList ?? [];

        const isArabic = this._languageService.getSelectedLanguage() === 'ar';

        this.taskCodeGroups = list.map((item: any) => ({
          label: isArabic
            ? item.nameAr || item.nameEn
            : item.nameEn || item.nameAr,
          value: item.id,
          nameEn: item.nameEn,
          nameAr: item.nameAr,
        }));

        console.log('✅ Task code groups loaded:', this.taskCodeGroups);

        // ★ الحل الأساسي: بعد ما الـ options اتحمّلت، ابني الفورم وقول للـ field يستخدم القيمة
        this.initForm();

        // ★ انتظر tick واحد لحد ما الـ Formly تبني الـ field، بعدين ضبط القيمة
        setTimeout(() => {
          const groupId = this.rowData?.taskCodeGroupId ?? this.rowData?.groupId;
          if (groupId != null) {
            const field = this.formly?.get('groupId');
            if (field) {
              field.setValue(Number(groupId));
              console.log('✅ groupId set on field:', Number(groupId));
            } else {
              console.warn('⚠️ Field groupId not found in form');
            }
          }
        });
      },
      error: (err) => {
        console.error('❌ loadTaskCodeGroups failed:', err);
        this.taskCodeGroups = [];
        this.initForm();
      },
    });
}

// خverride initForm(): void {
//   this.formlyFields = lookupsSubMatterListEditorConfig(this);
//   this.rowData = this._dynamicDialogConfig.data.rowData;

//   if (this.rowData) {
//     this.formlyModel = {
//       ...this.rowData,
//       ...this.formlyModel, 
//     };
//   }
// }


// override onSubmit(): void {
//   if (this.formly.invalid) {
//     this.formly.markAllAsTouched();
//     return;
//   }

//   this.isLoading = true;

//   const apiPath = this.rowData
//     ? this._dynamicDialogConfig.data.apiConfig.update
//     : this._dynamicDialogConfig.data.apiConfig.create;

//   const payload: any = {
//     ...(this.rowData || {}),
//     ...this.formlyModel,
//   };

//     if (payload.groupId) {
//     let groupIdValue: number | null = null;

//     if (typeof payload.groupId === 'object') {
//       groupIdValue = payload.groupId.value;
//     } 
//     else {
//       groupIdValue = payload.groupId;
//     }

//     const selectedGroup = this.taskCodeGroups.find(
//       g => g.value === groupIdValue
//     );

//     if (selectedGroup) {
//       payload.group = selectedGroup.label; 
//       payload.groupId = groupIdValue;      
//     }
//   }

//   delete payload.activeText;
//   delete payload.defaultText;

//   this._apiService
//     .post(apiPath, payload)
//     .pipe(
//       finalize(() => (this.isLoading = false)),
//       this._unsubscribe.takeUntilDestroy()
//     )
//     .subscribe({
//       next: (res: ApiRes) => {
//         if (res && res.isSuccess) {
//           this._toastrNotifiService.displaySuccess(res.message);
//           this._dynamicDialogRef.close(true);
//         }
//       },
//     });
// }

override onSubmit(): void {
  if (this.formly.invalid) {
    this.formly.markAllAsTouched();
    return;
  }

  this.isLoading = true;

  const apiConfig = this._dynamicDialogConfig.data.apiConfig;
  const isUpdate = !!this.rowData;

  // ============================================================
  // ★ بناء payload نظيف حسب groupId
  // ============================================================
  const payload = this.buildPayload();

  // ============================================================
  // ★ تحديد الـ URL والـ HTTP method
  // ============================================================
  const url = isUpdate
    ? `${apiConfig.update}/${this.rowData.id}`    // ★ PUT /MatterStatuses/5
    : apiConfig.create;                            // ★ POST /MatterStatuses

  const request$ = isUpdate
    ? this._apiService.put<ApiRes>(url, payload)    // ★ PUT
    : this._apiService.post<ApiRes>(url, payload);  // ★ POST

  console.log(`📤 ${isUpdate ? 'PUT' : 'POST'} ${url}`, payload);

  request$
    .pipe(
      finalize(() => (this.isLoading = false)),
      this._unsubscribe.takeUntilDestroy()
    )
    .subscribe({
      next: (res: ApiRes) => {
        if (res?.isSuccess) {
          this._toastrNotifiService.displaySuccess(res.message);
          this._dynamicDialogRef.close(true);
        }
      },
      error: (err) => {
        console.error('❌ Save failed:', err);
        this._toastrNotifiService.displayError(
          err?.error?.message || 'Failed to save'
        );
      },
    });
}

// ============================================================
// ★ payload نظيف — بيبني حسب groupId
// ============================================================
private buildPayload(): any {
  const model = this.formlyModel ?? {};
  const base: any = {
    nameEn: model.nameEn,
    nameAr: model.nameAr,
    isActive: model.active ?? model.isActive ?? true,
  };

  // ============================================================
  // ★ groupId = 7 → Task Codes
  // ============================================================
  if (this.groupId === 7) {
    // ★ الاسم الصح من الـ model
    const groupId =
      typeof model.groupId === 'object'
        ? model.groupId?.value ?? model.groupId?.id
        : model.groupId;

    // ★ الـ backend عايز "taskCodeGroupId" مش "groupId"
    base.taskCodeGroupId = groupId;
    base.isBillable = model.isBillable ?? false;

    // ★ Initial كمان لو الـ backend عايزه
    if (model.initial !== undefined) {
      base.initial = model.initial;
    }
  }

  // ============================================================
  // ★ groupId = 8 → Practice Areas
  // ============================================================
  if (this.groupId === 8) {
    base.isLitigation = model.isLitigation ?? false;
  }

  // ============================================================
  // ★ groupId = 13 → Task Code Groups
  // ============================================================
  if (this.groupId === 13) {
    if (!base.nameEn && base.nameAr) {
      base.nameEn = base.nameAr;
    }
    base.description = model.description ?? null;
    base.isDefault = model.isDefault ?? false;
  }

  console.log('📦 buildPayload for groupId', this.groupId, ':', base);
  return base;
}

}
