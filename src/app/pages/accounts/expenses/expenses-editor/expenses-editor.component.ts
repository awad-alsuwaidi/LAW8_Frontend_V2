import { Component, inject, input, InputSignal, OnInit } from '@angular/core';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { expensesEditorFormlyFields } from './expenses-editor-formly.config';
import { AuthService } from 'src/app/@core/services';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';

@Component({
  selector: 'app-expenses-editor',
  standalone: true,
  imports: [
    SharedModule,
    FormlyConfigModule,
    SharedButtonComponent,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './expenses-editor.component.html',
  styleUrl: './expenses-editor.component.scss',
})
export class ExpensesEditorComponent extends FormBaseClass implements OnInit {
  _authService = inject(AuthService);
  expensesIdentifier: InputSignal<any> = input();

  ngOnInit(): void {
    this.initForm();
    this.getLookupsData();
    //console.log('ExpensesEditorComponent');
  }
  override getLookupsData(): void {
    this.isLoading = true;

    combineLatest({
      lawyers: this._apiService.get(API_Config.responsibleLawyerSecurity.get),
      matters: this._apiService.get(API_Config.general.getMatterCodes),
      holds: this._apiService.get(API_Config.general.getAllBillingHold),
      types: this._apiService.get(API_Config.general.getAllBillingType),
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res) => {
          this.lookupsData = res;
          this.initForm();
        },
      });
  }
  override initForm(): void {
    this.formlyFields = expensesEditorFormlyFields(this);
    this.setFormData();
  }
  setFormData() {
    if (!this.expensesIdentifier()) return;
    const param = {
      id: this.expensesIdentifier(),
    };
    this._apiService
      .get(API_Config.billingExpenses.getById, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this.formlyModel = res.result;
            this.formlyModel.date = res.result.date?.split('T')[0];
          }
        },
      });
  }
  calcAmount() {
    const price = +this.formlyModel.price;
    const quantity = +this.formlyModel.quantity;
    if (price && quantity) {
      const amount = price * quantity;
      const amountControl = this.formly.get('amount');
      if (amountControl) {
        amountControl.setValue(amount);
      }
    }
  }
  cancel() {
    const savedFilters = this._route.snapshot.queryParams['savedFilters'];
    this._router.navigate(['/accounts/expenses'], {
      queryParams: { savedFilters },
    });
  }

  override onSubmit(): void {
    if (this.formly.invalid) {
      this.formly.markAllAsTouched();
      return;
    }
    this.formlyModel.amount = this.formlyModel?.amount?.toString();
    this.formlyModel.lawyerName = this.lookupsData.lawyers.result.find(
      (obj: any) => obj.id === this.formlyModel.lawyerId,
    )?.name;
    const requestPayload = this.expensesIdentifier()
      ? {
          ...this.formlyModel,
          id: this.expensesIdentifier(),
        }
      : [this.formlyModel];
    this.isSubmitted = true;
    this._apiService
      .post(
        this.expensesIdentifier()
          ? API_Config.billingExpenses.update
          : API_Config.billingExpenses.create,
        requestPayload,
      )
      .pipe(
        finalize(() => (this.isSubmitted = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          this._toastrNotifiService.displaySuccess(res.message);

          const savedFilters = this._route.snapshot.queryParams['savedFilters'];

          this._router.navigate(['/accounts/expenses'], {
            queryParams: { savedFilters },
          });
        },

        error: (err) => {
          console.log(err);

          if (err?.error?.errors) {
            const messages = Object.values(err.error.errors).flat().join('\n');

            this._toastrNotifiService.displayError(messages);
          } else {
            this._toastrNotifiService.displayError(
              err?.error?.title || 'Something went wrong',
            );
          }
        },
      });
  }
}
