import { Component, inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { combineLatest, finalize, of, tap, catchError } from 'rxjs';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { SharedModule } from 'src/app/@shared/shared.module';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { trustReceiptEditorFields } from './trust-receipt-editor.formly.config';
import { LanguageService } from 'src/app/@core/services/language.service';

type AllocationRow = {
  matterId: string | null;
  allocationCodeId: string | null;
  explanation?: string;
  description?: string;
  amount?: number;
  newBalance?: number;
};

@Component({
  selector: 'app-trust-receipt-editor',
  standalone: true,
  imports: [SharedModule, FormlyConfigModule, SharedButtonComponent],
  templateUrl: './trust-receipt-editor.component.html',
  styleUrl: './trust-receipt-editor.component.scss',
})
export class TrustReceiptEditorComponent
  extends FormBaseClass
  implements OnInit
{
  override formlyFields: FormlyFieldConfig[] = [];
  override formlyOptions: FormlyFormOptions = {
    formState: { isSubmitted: false },
  };
  override _languageService = inject(LanguageService);
  mattersOptions: Array<{ id: string; name: string }> = [];
  allocationCodesOptions: Array<{ id: string; name: string }> = [];

  private matterBalanceMap = new Map<string, number>();

  override isSubmitted = false;

  ngOnInit(): void {
    this.initForm();
    this.getLookupsData();
    this.getMatters();
    this.formlyOptions.formState = {
      ...(this.formlyOptions.formState || {}),
      vm: this,
    };
    this.formly.valueChanges
      ?.pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe(() => this.recalc());
  }

  override initForm(): void {
    this.formly = new FormGroup({});
    this.formlyModel = {
      accId: null,
      recepitNumber: '',
      amount: 0,
      date: new Date(),
      fromName: '',
      paymentMethodId: null,
      clientCheckNo: '',
      originalBank: '',
      notes: '',
      details: [
        {
          matterId: null,
          allocationCodeId: this.allocationCodesOptions?.[0]?.id ?? null,
          explanation: '',
          description: '',
          amount: 0,
          newBalance: 0,
        },
      ] as AllocationRow[],
      totalAllocated: 0,
      unAllocated: 0,
    };

    this.formlyFields = trustReceiptEditorFields(this);
  }

  override getLookupsData(): void {
    this.isLoading = true;

    const accounts$ = this._apiService
      .get(API_Config.general.getAccList)
      .pipe(
        catchError(() =>
          of({ result: [{ id: '1', name: 'Demo Account (static)' }] }),
        ),
      );

    const payments$ = this._apiService
      .get(API_Config.general.getPaymentsMethodList)
      .pipe(
        catchError(() => of({ result: [{ id: '1', name: 'Cash (static)' }] })),
      );

    const receipt$ = this._apiService
      .get(API_Config.trustFunds.getOrNewRandomReceipt)
      .pipe(
        catchError(() => of({ result: { code: this.generateReceiptCode() } })),
      );
    //////طه طاهااااا
    // {
    //       label: 'menu.trust',
    //       route: '/accounts',
    //       permission: 'View-Receipt444',
    //       children: [
    //         {
    //           label: 'menu.trustReceipt',
    //           route: '/accounts/trust-receipt',
    //           permission: 'View_Feeskkkk',
    //         },
    //         {
    //           label: 'menu.trustGeneral',
    //           route: '/accounts/trust-to-general',
    //           permission: 'View_Feeskkkkkkk',
    //         },
    //       ],
    //     },

    // const allocationCodes$ = this._apiService.get(API_Config.trustFunds.getAllocationCodes).pipe(
    //   catchError(() =>
    //     of({
    //       result: [
    //         { id: '1', name: 'Retainer (static)' },
    //         { id: '2', name: 'Deposit (static)' },
    //       ],
    //     })
    //   )
    // );

    combineLatest({
      accounts: accounts$,
      payments: payments$,
      recepitNumber: receipt$,
      // allocationCodes: allocationCodes$,
    })
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: any) => {
          this.lookupsData = res;

          this.allocationCodesOptions = res?.allocationCodes?.result || [];
          const firstCodeId = this.allocationCodesOptions?.[0]?.id ?? null;

          if (this.formlyModel.details?.length) {
            this.formlyModel.details = this.formlyModel.details.map(
              (r: any) => ({
                ...r,
                allocationCodeId: r.allocationCodeId ?? firstCodeId,
              }),
            );
          } else {
            this.formlyModel.details = [
              {
                matterId: null,
                allocationCodeId: firstCodeId,
                explanation: '',
                description: '',
                amount: 0,
                newBalance: 0,
              },
            ];
          }

          this.formlyModel = { ...this.formlyModel };
          this.recalc();

          this.formlyModel.recepitNumber =
            res?.recepitNumber?.result?.code || this.formlyModel.recepitNumber;
          this.formlyFields = trustReceiptEditorFields(this);
          this.formlyModel = { ...this.formlyModel };

          this.recalc();
        },
      });
  }

  getMatters(): void {
    this._apiService
      .get(API_Config.general.getMatterCodes)
      .pipe(
        catchError(() =>
          of({
            result: [
              { id: '101', name: 'MAT-101 | Static Matter' },
              { id: '202', name: 'MAT-202 | Static Matter' },
            ],
          }),
        ),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes | any) => {
          if (res?.result) {
            this.mattersOptions = res.result.map((x: any) => ({
              id: x.id?.toString(),
              name: x.name,
            }));
            this.formlyFields = trustReceiptEditorFields(this);
          }
        },
      });
  }

  get amount(): number {
    return Number(this.formlyModel?.amount ?? 0) || 0;
  }

  get allocations(): AllocationRow[] {
    return (this.formlyModel?.details || []) as AllocationRow[];
  }

  get totalAllocatedCalc(): number {
    return this.allocations.reduce((acc, r) => acc + Number(r.amount || 0), 0);
  }

  get unAllocatedCalc(): number {
    return this.amount - this.totalAllocatedCalc;
  }

  get canSubmit(): boolean {
    if (this.formly.invalid) return false;
    if (this.amount <= 0) return false;
    if (!this.allocations.some((r) => Number(r.amount || 0) > 0)) return false;
    return this.unAllocatedCalc === 0;
  }
  recalc(): void {
    const totalAllocated = this.totalAllocatedCalc;
    const unAllocated = this.unAllocatedCalc;

    this.formlyModel.totalAllocated = totalAllocated;
    this.formlyModel.unAllocated = unAllocated;

    // running sum per matter
    const runningByMatter = new Map<string, number>();

    const updatedRows = this.allocations.map((r) => {
      const mid = r.matterId?.toString();
      const amount = Number(r.amount || 0);

      if (!mid) {
        return { ...r, newBalance: 0 };
      }

      const currentBalance = this.getMatterCurrentBalance(mid);
      const prevSum = runningByMatter.get(mid) || 0;
      const newSum = prevSum + amount;

      runningByMatter.set(mid, newSum);

      return {
        ...r,
        newBalance: currentBalance + newSum,
      };
    });

    this.formlyModel.details = updatedRows;

    try {
      this.formly.patchValue(
        { totalAllocated, unAllocated },
        { emitEvent: false },
      );
    } catch {}

    this.formlyModel = { ...this.formlyModel };
  }

  // recalc(): void {
  //   const totalAllocated = this.totalAllocatedCalc;
  //   const unAllocated = this.unAllocatedCalc;

  //   this.formlyModel.totalAllocated = totalAllocated;
  //   this.formlyModel.unAllocated = unAllocated;
  //   const sumsByMatter = new Map<string, number>();
  //   for (const r of this.allocations) {
  //     const mid = r.matterId?.toString();
  //     if (!mid) continue;
  //     sumsByMatter.set(mid, (sumsByMatter.get(mid) || 0) + Number(r.amount || 0));
  //   }

  //   const updatedRows = this.allocations.map((r) => {
  //     const mid = r.matterId?.toString();
  //     const current = mid ? this.getMatterCurrentBalance(mid) : 0;
  //     const added = mid ? (sumsByMatter.get(mid) || 0) : 0;
  //     return { ...r, newBalance: current + added };
  //   });

  //   this.formlyModel.details = updatedRows;
  //   try {
  //     this.formly.patchValue(
  //       { totalAllocated, unAllocated },
  //       { emitEvent: false }
  //     );
  //   } catch {}

  //   this.formlyModel = { ...this.formlyModel };
  // }

  ensureMatterBalanceLoaded(matterId: string | null) {
    const mid = matterId?.toString();
    if (!mid) return of(true);

    if (this.matterBalanceMap.has(mid)) return of(true);

    return this._apiService
      .get(API_Config.trustFunds.getMatterTrustBalance, { matterId: mid })
      .pipe(
        catchError(() => of({ result: { currentTrustBalance: 0 } })),
        tap((res: any) => {
          const balance = Number(res?.result?.currentTrustBalance ?? 0);
          this.matterBalanceMap.set(mid, balance);
        }),
      );
  }

  getMatterCurrentBalance(matterId: string): number {
    return Number(this.matterBalanceMap.get(matterId) ?? 0) || 0;
  }

  override onSubmit(): void {
    this.isSubmitted = true;

    if (!this.canSubmit) {
      this.formly.markAllAsTouched();
      return;
    }
    const payload = {
      // id: '0',
      trustAccountId: String(this.formlyModel.trustAccountId ?? ''),
      recepitNumber: String(this.formlyModel.recepitNumber ?? ''),
      amount: String(this.formlyModel.amount ?? '0'),
      date: new Date(this.formlyModel.date).toISOString(),
      clientCheck: String(this.formlyModel.clientCheck ?? ''),
      receivedFrom: String(this.formlyModel.receivedFrom ?? ''),
      paymentMethodId: String(this.formlyModel.paymentMethodId ?? ''),
      description: '',
      note: String(this.formlyModel.note ?? ''),
      totalAmount: String(this.formlyModel.amount ?? '0'),
      totalAllocated: String(this.formlyModel.totalAllocated ?? '0'),
      unAllocated: String(this.formlyModel.unAllocated ?? '0'),
      details: (this.formlyModel.details || []).map((r: any) => ({
        matterId: String(r.matterId ?? ''),
        amount: String(r.amount ?? '0'),
        newBalance: String(r.newBalance ?? '0'),
      })),
    };

    this.isLoading = true;

    this._apiService
      .post(API_Config.trustFunds.createReceipt, payload)
      .pipe(
        finalize(() => (this.isLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess) {
            this._toastrNotifiService.displaySuccess('Created Successfully');
          } else {
            this._toastrNotifiService.displayError(res?.message || 'Failed');
          }
        },
      });
  }

  private generateReceiptCode(): string {
    const n = Date.now().toString().slice(-6);
    return `TR-${n}`;
  }
}
