import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { PreBillExpensesEditorComponent } from './pre-bill-expenses-editor/pre-bill-expenses-editor.component';
import { PreBillMainEditorComponent } from './pre-bill-main-editor/pre-bill-main-editor.component';
import { PreBillSummaryComponent } from './pre-bill-summary/pre-bill-summary.component';
import { PreBillTimeFeesEditorComponent } from './pre-bill-time-fees-editor/pre-bill-time-fees-editor.component';

@Component({
  selector: 'app-pre-bill-editor',
  standalone: true,
  imports: [
    SharedModule,
    FormlyConfigModule,
    SharedButtonComponent,
    PreBillExpensesEditorComponent,
    PreBillMainEditorComponent,
    PreBillTimeFeesEditorComponent,
    PreBillSummaryComponent,
  ],
  templateUrl: './pre-bill-editor.component.html',
  styleUrl: './pre-bill-editor.component.scss',
})
export class PreBillEditorComponent extends FormBaseClass implements OnInit {
  totalFees: number = 0;
  totalExpenses: number = 0;
  data: any = {};
  selectedFees: any[] = [];
selectedExpenses: any[] = [];

  ngOnInit(): void {
    this.initForm();
  }

override initForm(): void {
  this.formlyModel = {
    ...this.formlyModel,
    feesData: [],
    expensesData: [],
    totalFees: 0,
    totalExpenses: 0,
  };

  this.formlyFields = [
    { key: 'totalFees' },
    { key: 'totalExpenses' },
    { key: 'feesData' },
    { key: 'expensesData' },
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

getTotalFees(e: any) {
  console.log('PARENT FEES EVENT =>', e);

  const totalFees = Number(e?.total ?? 0);
  const selectedFees = e?.selected ?? [];

  this.selectedFees = selectedFees;

  this.formly.patchValue(
    {
      feesData: selectedFees,
      totalFees,
    },
    { emitEvent: false }
  );

  this.data = {
    ...this.data,
    totalFees,
  };

  this.calcSummary();
}

  onMatterChange(e: any) {
    this.data = { ...this.data, ...e };
    this.calcSummary();
  }

  onFeesLoaded(status: boolean) {
    this.data = { ...this.data, feesLoaded: status };
  }


calcSummary() {
  const totalFees = Number(this.data?.totalFees ?? 0);
  const totalExpenses = Number(this.data?.totalExpenses ?? 0);

  const taxesFeesPercent = Number(this.data?.taxesFees ?? 0);
  const taxesExpensesPercent = Number(this.data?.taxesExpenses ?? 0);

  const taxesFees = +(totalFees * (taxesFeesPercent / 100));
  const expensesFees = +(totalExpenses * (taxesExpensesPercent / 100));

  const grandTotal = taxesFees + expensesFees + totalFees + totalExpenses;

  this.data = {
    ...this.data,
    totalFees,
    totalExpenses,
    taxes: taxesFees,
    taxe: expensesFees,
    grandTotal,
  };
}

  cancel() {
    this._router.navigate(['/billing/bills']);
  }
  
  private createDiscountFeesRow(bill: any) {
    const discount = this.data?.discountValue ?? 0;
    if (!discount || discount <= 0) return;

    const matterId = Number(
      this.formly.value?.law_MatterId ?? this.data?.law_MatterId
    );
    if (!matterId) return;
    const usrSign =
      this.formly.value?.law_LawerId ??
      this.data?.law_LawerId ??
      bill?.usrSign ?? 
      null;

    const payload = [
      {
        matterId,
        law_LawerId: usrSign,
        amount: discount,
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
      .post(API_Config.timesheet.create, payload)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe();
  }


  override onSubmit(): void {
    if (this.formly.invalid) {
      this._toastrNotifiService.displayError('Please fill all required fields');
      return;
    }
const selectedFees =
  this.selectedFees.length > 0
    ? this.selectedFees
    : this.formly.get('feesData')?.value || [];

const selectedExpenses =
  this.selectedExpenses.length > 0
    ? this.selectedExpenses
    : this.formly.get('expensesData')?.value || [];

if (!selectedFees.length) {
  console.log('selectedFees EMPTY =>', selectedFees);
  console.log('form feesData =>', this.formly.get('feesData')?.value);
  console.log('component selectedFees =>', this.selectedFees);

  this._toastrNotifiService.displayError('Please load and select time fees first');
  return;
}
   const model = {
  law_MatterId: this.formly.value?.law_MatterId?.toString(),
  invoiceNumber: this.formly.value.invoiceNumber,
  templetId: this.formly.value.templetId,
  date: this.formly.value.date,

  totalFees: Number(this.data?.totalFees ?? 0),
  taxes: Number(this.data?.taxes ?? 0),
  totalExpenses: Number(this.data?.totalExpenses ?? 0),
  taxe: Number(this.data?.taxe ?? 0),
  grandTotal: Number(this.data?.grandTotal ?? 0),

  discountValue: this.data?.discountValue ?? 0,
  discountTypeId: this.data?.discountTypeId ?? 2,

  timeSheetEndDate: this.formly.value.timeSheetEndDate,
  timeSheetStartDate: this.formly.value.timeSheetStartDate,

  discountExplanation: this.data?.discountExplanation ?? '',
  totalAfterDiscount: this.data?.totalAfterDiscount ?? Number(this.data?.totalFees ?? 0),

  billingExpenses: selectedExpenses.map((obj: any) => ({
    id: obj.id,
  })),

billingTimeFees: selectedFees.map((obj: any) => ({
  id: obj.id,
})),
};

    this.isLoading = true;

    this._apiService
      .post(API_Config.billing.create, model)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: ApiRes) => {
  if (res.isSuccess) {
    this._toastrNotifiService.displaySuccess(res.message);

    if (res.message) {
      window.open(res.message, '_blank'); 
    }

    const newPreBill = res.result;
    this.createDiscountFeesRow(newPreBill);

    this._router
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => {
        this._router.navigate(['/billing/pre-bill/add']);
      });
  }
}
      });
  }

  resetForm(): void {
    this.data = {
      totalFees: 0,
      totalExpenses: 0,
      previousBalance: 0,
      trustBankAccount: 0,
      taxes: 0,
      taxe: 0,
      grandTotal: 0,
      taxesFees: 0,
      taxesExpenses: 0,
    };

    this.totalFees = 0;
    this.totalExpenses = 0;

    this.formly.reset();

    this.formlyModel = {
      date: new Date(),
      expensesData: [],
      feesData: [],
    };

    this.formly.markAsPristine();
    this.formly.markAsUntouched();
    this.formly.updateValueAndValidity();
  }
  getTotalExpenses(e: any) {
  const totalExpenses = Number(e?.total ?? 0);
  const selectedExpenses = e?.selected ?? [];

  this.selectedExpenses = selectedExpenses;

  this.formly.patchValue(
    {
      expensesData: selectedExpenses,
      totalExpenses,
    },
    { emitEvent: false }
  );

  this.data = {
    ...this.data,
    totalExpenses,
  };

  this.calcSummary();
}
}
