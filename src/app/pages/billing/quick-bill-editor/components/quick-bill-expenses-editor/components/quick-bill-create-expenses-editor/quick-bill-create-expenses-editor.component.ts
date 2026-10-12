import {
  Component,
  inject,
  Input,
  input,
  InputSignal,
  OnInit,
} from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { AuthService } from 'src/app/@core/services';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { expensesEditorFormlyFields } from 'src/app/pages/accounts/expenses/expenses-editor/expenses-editor-formly.config';

@Component({
  selector: 'app-quick-bill-create-expenses-editor',
  standalone: true,
  imports: [
    SharedModule,
    FormlyConfigModule,
    SharedButtonComponent,
    SharedSkeletonGridComponent,
  ],
  templateUrl: './quick-bill-create-expenses-editor.component.html',
  styleUrl: './quick-bill-create-expenses-editor.component.scss',
})
export class QuickBillCreateExpensesEditorComponent
  extends FormBaseClass
  implements OnInit
{
  _authService = inject(AuthService);
  expensesIdentifier: InputSignal<any> = input();


 config = inject(DynamicDialogConfig);
  @Input() matter!: number;

  ngOnInit(): void {
    this.matter = this.config.data?.matter;

    console.log("Received matter:", this.matter);

    this.getLookupsData();
  }

  override initForm(): void {
    this.formlyFields = expensesEditorFormlyFields(this);
    this.setFormData();
    setTimeout(() => {
      const matterControl = this.formly.get('matterId');
      if (matterControl) {
        matterControl.setValue(this.matter);
        matterControl.disable();
      }
    });
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
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res) => {
          this.lookupsData = res;
          this.initForm();
        },
      });
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
            this.formlyModel.date = new Date(res.result.date);
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
  cancel() {}
  override onSubmit(): void {
    if (this.formly.invalid) {
      this.formly.markAllAsTouched();
      return;
    }
    this.formlyModel.amount = this.formlyModel?.amount?.toString();
    this.formlyModel.typeName = this.formlyModel.type;
    this.formlyModel.lawyerName = this.lookupsData.lawyers.result.find(
      (obj: any) => obj.id === this.formlyModel.lawyerId
    )?.name;
    const requestPayload = this.formlyModel;
    this.isSubmitted = true;

    this._apiService
      .post(API_Config.quickBill.createBillExpenses, requestPayload)
      .pipe(
        finalize(() => (this.isSubmitted = false)),
        this._unsubscribe.takeUntilDestroy()
      )
     .subscribe({
  next: (res: ApiRes) => {
    console.log(res);

    if (res?.isSuccess) {
      this._toastrNotifiService.displaySuccess(res?.message || 'Success');
      this._dynamicDialogRef.close(true);
    } else {
      this._toastrNotifiService.displayError(res?.message || 'Something went wrong');
    }
  },
  error: (err) => {
    const message =
      err?.error?.message || err?.message || 'Server error';

    this._toastrNotifiService.displayError(message);
  }
});
  }
}
