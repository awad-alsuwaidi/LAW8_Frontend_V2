import { Component, input, InputSignal, OnInit } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedModule } from 'src/app/@shared/shared.module';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { BillsMainEditorComponent } from './components/bills-main-editor/bills-main-editor.component';
import { BillsTimeFeesEditorComponent } from './components/bills-time-fees-editor/bills-time-fees-editor.component';
import { BillsExpensesEditorComponent } from './components/bills-expenses-editor/bills-expenses-editor.component';
import { BillsSummaryComponent } from './components/bills-summary/bills-summary.component';
import { finalize } from 'rxjs';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { inject } from '@angular/core';
import { AuthService } from 'src/app/@core/services';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-bills-editor',
  standalone: true,
  imports: [
    SharedModule,
    FormlyConfigModule,
    BillsMainEditorComponent,
    BillsTimeFeesEditorComponent,
    BillsExpensesEditorComponent,
    BillsSummaryComponent,
    SharedButtonComponent,
  ],
  templateUrl: './bills-editor.component.html',
  styleUrl: './bills-editor.component.scss',
})
export class BillsEditorComponent extends FormBaseClass implements OnInit {
  totalFees: number = 0;
  totalExpenses: number = 0;
  billIdentifier: InputSignal<any> = input();
  data: any = {};
  selectedFees: any[] = [];
  selectedExpenses: any[] = [];
  constructor(
    private _authService: AuthService,
    override _route: ActivatedRoute,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initForm();
    const matterId = this._route.snapshot.queryParams['matterId'];

    if (matterId) {
      this.formly.patchValue({
        law_MatterId: +matterId,
      });

      this.formlyModel = {
        ...this.formlyModel,
        law_MatterId: +matterId,
      };
    }
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

    this.setFormData();
  }

  setFormData() {
    if (!this.billIdentifier()) return;
    const param = {
      id: this.billIdentifier(),
      LoadFile: false,
    };
    this._apiService
      .get(API_Config.bill.getById, param)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            const fees = res.result?.billingTimeFees || [];
            const expenses = res.result?.billingExpenses || [];

            this.selectedFees = fees;
            this.selectedExpenses = expenses;

            this.formlyModel = {
              ...res.result,
              date: new Date(res.result.date),
              feesData: fees,
              expensesData: expenses,
              expenses: res.result.expenses ?? {},
            };

            this.data = {
              ...res.result,
              totalFees: Number(res.result?.totalFees ?? 0),
              totalExpenses: Number(res.result?.totalExpenses ?? 0),
            };

            this.formly.patchValue(
              {
                feesData: fees,
                expensesData: expenses,
                totalFees: Number(res.result?.totalFees ?? 0),
                totalExpenses: Number(res.result?.totalExpenses ?? 0),
              },
              { emitEvent: false },
            );
          }
        },
      });
  }

  getTotalFees(e: any) {
    const totalFees = Number(e?.total ?? 0);
    const selectedFees = e?.selected ?? [];

    this.selectedFees = selectedFees;

    this.formly.patchValue(
      {
        feesData: selectedFees,
        totalFees,
      },
      { emitEvent: false },
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

  getTotalExpenses(e: any) {
    const totalExpenses = Number(e?.total ?? 0);
    const selectedExpenses = e?.selected ?? [];

    this.selectedExpenses = selectedExpenses;

    this.formly.patchValue(
      {
        expensesData: selectedExpenses,
        totalExpenses,
      },
      { emitEvent: false },
    );

    this.data = {
      ...this.data,
      totalExpenses,
    };

    this.calcSummary();
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

  cancel() {
    this._router.navigate(['/billing/bills']);
  }

  getDecodedToken(): any {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  private createDiscountFeesRow(bill: any) {
    const discount = this.data?.discountValue ?? 0;
    if (!discount || discount <= 0) return;

    const matterId = Number(
      this.formly.value?.law_MatterId ?? this.data?.law_MatterId,
    );
    if (!matterId) return;

    const decodedToken = this._authService.getDecodedToken();
    const lawyerId = decodedToken?.DefUsrId || decodedToken?.Id;

    if (!lawyerId) {
      console.error('Lawyer ID not found in token');
      return;
    }

    const payload = [
      {
        matterId,
        law_LawerId: lawyerId,
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
      this.scrollToTop();
      this._toastrNotifiService.displayError('Please fill all required fields');
      return;
    }

    if (this.formly.invalid) return;
    const selectedFees =
      this.selectedFees.length > 0
        ? this.selectedFees
        : this.formly.get('feesData')?.value ||
          this.formly.value?.feesData ||
          [];

    const selectedExpenses =
      this.selectedExpenses.length > 0
        ? this.selectedExpenses
        : this.formly.get('expensesData')?.value ||
          this.formly.value?.expensesData ||
          [];

    console.log('formly.value.expenses:', this.formly.value.expenses);
    console.log(
      'formly.value.expenses.expensesData:',
      this.formly.value.expenses?.expensesData,
    );

    const model = {
      id: this.billIdentifier() ? this.billIdentifier() : 0,
      law_MatterId: this.formly.value?.law_MatterId?.toString(),
      invoiceNumber: this.formly.value.invoiceNumber,
      templetId: this.formly.value.templetId,
      date: this.formly.value.date,
      timeSheetEndDate: this.formly.value.timeSheetEndDate,
      timeSheetStartDate: this.formly.value.timeSheetStartDate,

      totalFees: Number(this.data?.totalFees ?? 0),
      taxes: Number(this.data?.taxes ?? 0),
      totalExpenses: Number(this.data?.totalExpenses ?? 0),
      taxe: Number(this.data?.taxe ?? 0),
      grandTotal: Number(this.data?.grandTotal ?? 0),

      // discount
      discountValue: this.data?.discountValue ?? 0,
      // discountTypeId: this.data?.discountTypeId ?? 1,
      discountExplanation: this.data?.discountExplanation ?? '',

      totalAfterDiscount: this.data?.totalAfterDiscount,

      billingExpenses: selectedExpenses.map((obj: any) => ({
        id: obj.id,
      })),

      billingTimeFees: selectedFees.map((obj: any) => ({
        id: obj.id,
      })),
    };

    this.isLoading = true;

    const isEdit = !!this.billIdentifier();
    const api = isEdit ? API_Config.bill.update : API_Config.bill.create;

    this._apiService
      .post(api, model)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this._toastrNotifiService.displaySuccess(
              this._languageService.getTransValue('billing.billsuccessmsg'),
            );

            const newBill = res.result;

            this.createDiscountFeesRow(newBill);

            this._router
              .navigateByUrl('/', { skipLocationChange: true })
              .then(() => {
                this._router.navigate(['/billing/bills/add']);
              });

            if (res.message && res.message.startsWith('http')) {
              window.open(res.message, '_blank');
            }

            this.resetForm();
          } else {
            this._toastrNotifiService.displayError(res.message);
          }
        },
      });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  resetForm(): void {
    this.formly.reset();
    this.formlyModel = {
      expenses: { expensesData: [] },
      feesData: [],
    };
  }
}
