import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { QuickBillMainEditorComponent } from './components/quick-bill-main-editor/quick-bill-main-editor.component';
import { QuickBillTimeFeesEditorComponent } from './components/quick-bill-time-fees-editor/quick-bill-time-fees-editor.component';
import { QuickBillExpensesEditorComponent } from './components/quick-bill-expenses-editor/quick-bill-expenses-editor.component';
import { QuickBillSummaryComponent } from './components/quick-bill-summary/quick-bill-summary.component';

@Component({
  selector: 'app-quick-bill-editor',
  standalone: true,
  imports: [
    SharedModule,
    FormlyConfigModule,
    SharedButtonComponent,
    QuickBillMainEditorComponent,
    QuickBillTimeFeesEditorComponent,
    QuickBillExpensesEditorComponent,
    QuickBillSummaryComponent,
  ],
  templateUrl: './quick-bill-editor.component.html',
  styleUrl: './quick-bill-editor.component.scss',
})
export class QuickBillEditorComponent extends FormBaseClass implements OnInit {
  totalFees: number = 0;
  totalExpenses: number = 0;
  data: any;
  ngOnInit(): void {
    this.initForm();
  }
  override initForm(): void {
    this.formlyFields = [
      { key: 'totalExpenses' },
      { key: 'previousBalance' },
      { key: 'trustBankAccount' },
      { key: 'taxes' },
      { key: 'taxe' },
      { key: 'grandTotal' },
    ];
  }
  onDiscountApplied(e: any) {
    this.data = {
      ...this.data,
      discountValue: e.discount,
      discountTypeId: e.discountTypeId,
      discountExplanation: e.explanation,
      totalAfterDiscount: e.totalAfterDiscount,
      taxes: e.taxes,
      grandTotal: e.grandTotal,
    };
  }
  onMatterChange(e: any) {
    this.data = { ...this.data, ...e };
    this.calcSummary();
  }

  getTotalExpenses(totalExpenses: number) {
    this.data = { ...this.data, totalExpenses: totalExpenses };
    this.calcSummary();
  }
  calcSummary() {
    const taxesFees = +(this.data?.totalFees * (this.data?.taxesFees / 100));
    const expensesFees = +(
      this.data?.totalExpenses *
      (this.data?.taxesExpenses / 100)
    );

    const grandTotal =
      taxesFees +
      expensesFees +
      this.data?.totalFees +
      this.data?.totalExpenses;
    this.data = {
      ...this.data,
      taxes: taxesFees,
      taxe: expensesFees,
      grandTotal,
    };
  }

  onAmountChanged(amount: number) {
    console.log('%c[Parent] Received amount:', 'color:blue', amount);
    this.data = { ...this.data, totalFees: amount };
    this.calcSummary();
  }
  private getLawyerIdFromToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.DefUsrId || payload?.Id || null;
    } catch {
      return null;
    }
  }
  private createDiscountFeesRow(bill: any) {
    const matterId = Number(
      this.formly.value?.law_MatterId ?? this.data?.law_MatterId,
    );
    if (!matterId) return;

    const lawyerId = this.getLawyerIdFromToken();
    if (!lawyerId) return;

    const payload = [
      {
        matterId,
        law_LawerId: lawyerId,
        amount: this.data?.discountValue ?? 0,
        tmDate: bill?.date ?? new Date(),
        typeId: 2,
        hours: 0,
        tsTimmer: 0,
        rate: 0,
        law_TaskCodeId: 1,
        explanationExplanation: this.data?.discountExplanation || '',
      },
    ];

    this._apiService
      .post('/api/TimeSheet/SubmitTemps', payload)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res) => console.log('SubmitTemps success', res),
        error: (err) => console.error('SubmitTemps error', err),
      });
  }

  cancel() {}
  override onSubmit(): void {
    if (this.formly.invalid) {
      this._toastrNotifiService.displayError('Please fill all required fields');
      return;
    }

    if (this.formly.invalid) return;
    const model = {
      law_MatterId: this.formly.value?.law_MatterId?.toString(),
      invoiceNumber: this.formly.value.invoiceNumber,
      templetId: this.formly.value.templetId,
      date: this.formly.value.date,
      totalFees: this.data?.totalFees,
      taxes: this.data?.taxes,
      totalExpenses: this.data?.totalExpenses,
      taxe: this.data?.taxe,
      discountValue: this.data?.discountValue ?? 0,
      discountTypeId: this.data?.discountTypeId ?? 2,
      discountExplanation: this.data?.discountExplanation ?? '',
      grandTotal: this.data?.grandTotal,
      amount: this.formly.value.amount,
      explanation: this.formly.value.explanation,
      billingExpenses: this.formly.value?.expensesData?.map((obj: any) => ({
        id: obj.id,
      })),
    };
    this.isLoading = true;

    this._apiService
      .post(API_Config.quickBill.create, model)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this._toastrNotifiService.displaySuccess(res.message);
            const newPreBill = res.result;
            this.createDiscountFeesRow(newPreBill);
            this.resetForm();
            this._router
              .navigateByUrl('/', { skipLocationChange: true })
              .then(() => {
                this._router.navigate(['/billing/quick-bill/add']);
              });
          }
        },
      });
  }
  resetForm(): void {
    this.formly.reset();
    this.formlyModel = {
      expenses: { expensesData: [] },
      feesData: [],
    };
  }
}
