import { Component, inject, input, InputSignal, OnInit } from '@angular/core';
import { combineLatest, finalize, of } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { feesEditorFormlyFields } from './fees-editor-formly.config';
import { AuthService } from 'src/app/@core/services';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';

@Component({
  selector: 'app-fees-editor',
  standalone: true,
  imports: [
    SharedModule,
    FormlyConfigModule,
    SharedButtonComponent,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './fees-editor.component.html',
  styleUrl: './fees-editor.component.scss',
})
export class FeesEditorComponent extends FormBaseClass implements OnInit {
  _authService = inject(AuthService);
  feesIdentifier: InputSignal<any> = input();
  isEditMode = false;
isPageReady = false;

// ngOnInit(): void {
//   this.isEditMode = !!this.feesIdentifier();  
//   this.initForm();
//   this.getLookupsData();
// }
ngOnInit(): void {
  this.isEditMode = !!this.feesIdentifier();
  this.loadAllData();
}

private loadAllData(): void {
  this.isLoading = true;
  this.isPageReady = false;

  const lookups$ = combineLatest({
    lawyers: this._apiService.get(API_Config.responsibleLawyerSecurity.get),
    matters: this._apiService.get(API_Config.general.getMatterCodes),
    holds: this._apiService.get(API_Config.general.getAllBillingHold),
  });

  const editData$ = this.isEditMode
    ? this._apiService.get(API_Config.timesheet.getById, {
        id: this.feesIdentifier(),
        typeId: 2,
      })
    : of(null); // 👈 مهم جداً

  combineLatest([lookups$, editData$])
    .pipe(
      this._unsubscribe.takeUntilDestroy(),
      finalize(() => {
        this.isLoading = false;
        this.isPageReady = true;
      })
    )
    .subscribe({
      next: ([lookupsRes, editRes]: any) => {
        this.lookupsData = lookupsRes;

        if (this.isEditMode && editRes?.isSuccess) {
          this.formlyModel = editRes.result;
          this.formlyModel.tmDate = new Date(editRes.result.tmDate);
        }

        this.initForm();
      },
    });
}

  override getLookupsData(): void {
    this.isLoading = true;

    combineLatest({
      lawyers: this._apiService.get(API_Config.responsibleLawyerSecurity.get),
      matters: this._apiService.get(API_Config.general.getMatterCodes),
      holds: this._apiService.get(API_Config.general.getAllBillingHold),

    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res) => {
          this.lookupsData = res;
          this.initForm();
        },
      });
  }

  override initForm(): void {
    this.formlyFields = feesEditorFormlyFields(this);
    this.setFormData();
  }

  setFormData() {
    if (!this.feesIdentifier()) return;
    const param = {
      id: this.feesIdentifier(),
      typeId: 2, 
    };
    this._apiService
      .get(API_Config.timesheet.getById, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this.formlyModel = res.result;
            this.formlyModel.tmDate = new Date(res.result.tmDate);
          }
        },
      });
  }

override onSubmit(): void {
  if (this.formly.invalid) {
    this.formly.markAllAsTouched();
    return;
  }

const payload = {
  ...this.formlyModel,
  typeId: 2,
  hours: 0,
  tsTimmer: 0,
  rate: 0,
  holdId: this.isEditMode 
    ? this.formlyModel?.holdId      
    : 1,                                

  law_TaskCodeId: 1,
  notes: this.formlyModel?.notes || '',
};

  const requestPayload = this.feesIdentifier()
    ? { ...payload, id: this.feesIdentifier() } 
    : [payload]; 

  this.isSubmitted = true;

  this._apiService
    .post(
      this.feesIdentifier()
        ? API_Config.timesheet.updateList 
        : API_Config.timesheet.create, 
      requestPayload
    )
    .pipe(
      finalize(() => (this.isSubmitted = false)),
      this._unsubscribe.takeUntilDestroy()
    )
    .subscribe({
      next: (res: ApiRes) => {
        this._toastrNotifiService.displaySuccess(res.message);
        // this._router.navigate(['/accounts/fees']);
        const savedFilters = this._route.snapshot.queryParams['savedFilters'];

this._router.navigate(
  ['/accounts/fees'],
  {
    queryParams: {
      savedFilters
    }
  }
);

      },
    });
}
cancel() {
  const savedFilters = this._route.snapshot.queryParams['savedFilters'];

  this._router.navigate(
    ['/accounts/fees'],
    { queryParams: { savedFilters } }
  );
}

}
