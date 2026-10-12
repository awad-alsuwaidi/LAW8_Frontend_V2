import { Component, OnInit } from '@angular/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedModule } from 'src/app/@shared/shared.module';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { recievePaymentMainEditorFields } from './recieve-payment-editor-main-formly.config';
import { recievePaymentReferenceEditorFields } from './recieve-payment-editor-reference-formly.config';
import { recievePaymentSummaryEditorFields } from './recieve-payment-summary-formly.config';
import { combineLatest, finalize } from 'rxjs';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { findField } from 'src/app/@core/utilities/functions/find-field';
import { getOptionsArray } from 'src/app/@core/utilities/functions/get-options-arr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-recieve-payment-editor',
  standalone: true,
  imports: [
    SharedModule,
    FormlyConfigModule,
    SharedButtonComponent,
  ],
  templateUrl: './recieve-payment-editor.component.html',
  styleUrl: './recieve-payment-editor.component.scss',
})
export class RecievePaymentEditorComponent
  extends FormBaseClass
  implements OnInit
{
  sumPaymentsExceedAmount: boolean = false;
    isInhouse = environment.brand === 'inhouse';
    isLoadingInvoices = false;

  ngOnInit(): void {
    this.initForm();
    this.getLookupsData();
    this.getMatters();
  }

  override getLookupsData(): void {
    this.isLoading = true;
    combineLatest({
      accounts: this._apiService.get(API_Config.general.getAccList),
      payments: this._apiService.get(API_Config.general.getPaymentsMethodList),
      receipt: this._apiService.get(
        API_Config.recievePayment.getOrNewRandomReceipt
      ),
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
    this.formlyFields = [
      ...recievePaymentMainEditorFields(this),
      ...recievePaymentReferenceEditorFields(this),
      ...recievePaymentSummaryEditorFields(this),
    ];
  }
  getMatters() {
    this._apiService
      .get(API_Config.general.getMatterCodes)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.result) {
            const field: FormlyFieldConfig = findField(
              this.formlyFields,
              'matterId'
            );
            if (field && field.props) {
              field.props['optionsArr'] = getOptionsArray(
                res.result,
                'id',
                'name'
              );
            }
          }
        },
      });
  }
  getClients() {
    this._apiService
      .get(API_Config.general.getClients)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.result) {
            const field: FormlyFieldConfig = findField(
              this.formlyFields,
              'clientId'
            );
            if (field && field.props) {
              field.props['optionsArr'] = getOptionsArray(
                res.result,
                'id',
                'name',
                'object'
              );
            }
          }
        },
      });
  }
  getInvoices() {
    this._apiService
      .get(API_Config.general.getInvoicesList)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.result) {
            const field: FormlyFieldConfig = findField(
              this.formlyFields,
              'invoiceId'
            );
            if (field && field.props) {
              field.props['optionsArr'] = getOptionsArray(
                res.result,
                'id',
                'name'
              );
            }
          }
        },
      });
  }
  // getInvoiceList() {
  //   const params = {
  //     MatterId: this.formlyModel?.matterId,
  //     ClientId: this.formlyModel?.clientId?.id,
  //     InvoiceId: this.formlyModel?.invoiceId,
  //   };
  //   this._apiService
  //     .get(API_Config.recievePayment.getInvoiceList, params)
  //     .pipe(this._unsubscribe.takeUntilDestroy())
  //     .subscribe({
  //       next: (res: ApiRes) => {
  //         if (res.isSuccess) {
  //           const invoicesData = res.result.map((invoice: any) => ({
  //             ...invoice,
  //             date: invoice.date
  //               ? new Date(invoice.date).toISOString().split('T')[0]
  //               : '',
  //                disb: invoice.totalExpenses,
  //           }));
  //           this.formlyModel = {
  //             ...this.formlyModel,
  //             invoicesDetails: invoicesData,
  //           };
  //         }
  //       },
  //     });
  // }
  getInvoiceList() {
  const params = {
    MatterId: this.formlyModel?.matterId,
    ClientId: this.formlyModel?.clientId?.id,
    InvoiceId: this.formlyModel?.invoiceId,
  };

  this.isLoadingInvoices = true;

  this._apiService
    .get(API_Config.recievePayment.getInvoiceList, params)
    .pipe(
      finalize(() => (this.isLoadingInvoices = false)),
      this._unsubscribe.takeUntilDestroy()
    )
    .subscribe({
      next: (res: ApiRes) => {
        if (res.isSuccess) {
          const invoicesData = res.result.map((invoice: any) => ({
            ...invoice,
            date: invoice.date
              ? new Date(invoice.date).toISOString().split('T')[0]
              : '',
            disb: invoice.totalExpenses,
          }));

          this.formlyModel = {
            ...this.formlyModel,
            invoicesDetails: invoicesData,
          };
        }
      },
    });
}
  checkMoreThanAmount() {
    console.log('this.checkMoreThanAmount');
    const totalPayment =
      this.formlyModel?.invoicesDetails?.reduce(
        (acc: any, curr: any) => acc + +curr.payment,
        0
      ) || 0;
    const totalAllocated = this.formlyModel.amount - totalPayment;
    if (totalAllocated < 0) {
      this.sumPaymentsExceedAmount = true;
      this._toastrNotifiService.displayError(
        'Total payment should not be more than Amount'
      );
      return;
    } else {
      this.sumPaymentsExceedAmount = false;
      this.formlyModel.totalAllocated = totalPayment || 0;
      this.formlyModel.unAllocated = totalAllocated || 0;
      this.formlyModel = { ...this.formlyModel };
    }
  }

  checkMoreThanUnallocated(value: any) {
    return +value > +this.formlyModel.unAllocated;
  }
  calcUnallocated() {
    const totalPayment =
      this.formlyModel?.invoicesDetails?.reduce(
        (acc: any, curr: any) => acc + +curr.payment,
        0
      ) || 0;

    const transferOrRemaining =
      this.formlyModel.transferToTrust ||
      this.formlyModel.sendRefundToClient ||
      0;

    const totalAllocated = totalPayment + Number(transferOrRemaining);
    const unAllocated = (this.formlyModel.amount ?? 0) - totalAllocated;

    this.formlyModel.totalAllocated = totalAllocated;
    this.formlyModel.unAllocated = unAllocated;
    this.formly.patchValue({
      totalAllocated: totalAllocated,
      unAllocated: unAllocated,
    });
  }
 
  override onSubmit(): void {
    this.calcUnallocated();

    console.log('Amount:', this.formlyModel.amount);
    console.log('Total Allocated:', this.formlyModel.totalAllocated);
    console.log('Unallocated:', this.formlyModel.unAllocated);
    console.log('Transfer:', this.formlyModel.transferToTrust);
    console.log('Refund:', this.formlyModel.sendRefundToClient);

    if (this.formly.invalid || this.sumPaymentsExceedAmount) {
      this.formly.markAllAsTouched();
      return;
    }
    if (this.formlyModel.unAllocated !== 0) {
      this._toastrNotifiService.displayError(
        `Unallocated amount must be zero "0": ${this.formlyModel.unAllocated}`
      );
      return;
    }

    this.isLoading = true;

    const payload = this.formlyModel;
    payload.invoicesDetails = payload.invoicesDetails.map((obj: any) => ({
      invoiceId: obj.id?.toString() || '',
      payment: obj.payment,
    }));
    payload.clientId = payload.clientId;
    payload.accId = payload?.accId?.toString();
    payload.matterId = payload?.matterId?.toString();
    payload.invoiceId = payload?.invoiceId?.toString();

    this._apiService
      .post(API_Config.recievePayment.create, payload)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            this._toastrNotifiService.displaySuccess(res.message);
          }
        },
      });
  }
}
