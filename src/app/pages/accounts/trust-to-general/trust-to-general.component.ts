import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { combineLatest, finalize, of, catchError, tap } from 'rxjs';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';

import { SharedModule } from 'src/app/@shared/shared.module';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';

import { FormBaseClass } from 'src/app/@core/classes/form-base.class';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';

import { trustToGeneralFields } from './trust-to-general.component.config';
import { SharedSkeletonGridComponent } from 'src/app/@shared/components/shared-skeleton-grid/shared-skeleton-grid.component';

type MatterInfo = {
  matterCode?: string;
  client?: string;
  responsibleLawyer?: string;
  trustBalance?: number;
};

type BillRow = {
  id: string;
  billNo: string;
  date: string; 
  totalBill: number;
  paid: number;
  outstanding: number;

  selected: boolean;
  transferAmount: number;
};

@Component({
  selector: 'app-trust-to-general',
  standalone: true,
  imports: [SharedModule, FormlyConfigModule, SharedButtonComponent,SharedSkeletonGridComponent],
  templateUrl: './trust-to-general.component.html',
  styleUrl: './trust-to-general.component.scss',
})
export class TrustToGeneralComponent extends FormBaseClass implements OnInit {

  @ViewChild('matterInfoTpl', { static: true }) matterInfoTpl!: TemplateRef<any>;
  @ViewChild('billsTpl', { static: true }) billsTpl!: TemplateRef<any>;
  @ViewChild('summaryTpl', { static: true }) summaryTpl!: TemplateRef<any>;

  override formlyFields: FormlyFieldConfig[] = [];
  override formlyOptions: FormlyFormOptions = { formState: { isSubmitted: false } };

  mattersOptions: Array<{ id: string; name: string }> = [];
  trustAccountsOptions: Array<{ id: string; name: string }> = [];
  generalAccountsOptions: Array<{ id: string; name: string }> = [];

  matterInfo: MatterInfo | null = null;
  bills: BillRow[] = [];
pageLoading = false;   
submitLoading = false; 
  trustAccountBalance = 0; 
  matterTrustBalance = 0; 

  private nf = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  money(v: any) { return this.nf.format(Number(v ?? 0) || 0); }

ngOnInit() {
  this.initForm();
}
override initForm(): void {
  this.formly = new FormGroup({});
  
  this.formlyModel = {
    fromTrustAccountId: null,
    availableTrustBalance: 0,
    toGeneralAccountId: null,
    transferDate: new Date(),
    referenceNo: '',
    memo: '',
    matterId: null,
  };

  this.formlyOptions.formState = { ...(this.formlyOptions.formState || {}), vm: this };

  this.loadPageLookups();
}
  private loadPageLookups(): void {
  this.pageLoading = true;

    const trustAccounts$ = this._apiService.get(API_Config.general.getAccList).pipe(
      catchError(() => of({ result: [] }))
    );

    const generalAccounts$ = this._apiService.get(API_Config.general.getAccList).pipe(
      catchError(() => of({ result: [] }))
    );

    const matters$ = this._apiService.get(API_Config.general.getMatterCodes).pipe(
      catchError(() => of({ result: [] }))
    );

    combineLatest({ trustAccounts: trustAccounts$, generalAccounts: generalAccounts$, matters: matters$ })
      .pipe(
        finalize(() => (this.pageLoading = false)),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: any) => {
          this.lookupsData = res;

          this.trustAccountsOptions = (res?.trustAccounts?.result || []).map((x: any) => ({
            id: String(x.id),
            name: x.name,
          }));

          this.generalAccountsOptions = (res?.generalAccounts?.result || []).map((x: any) => ({
            id: String(x.id),
            name: x.name,
          }));

          this.mattersOptions = (res?.matters?.result || []).map((x: any) => ({
            id: String(x.id),
            name: x.name,
          }));

          this.formlyFields = trustToGeneralFields(this);
        },
      });
  }

  loadTrustAccountBalance(trustAccountId: string | null) {
    const id = trustAccountId ? String(trustAccountId) : null;

    if (!id) {
      this.trustAccountBalance = 0;
      this.formlyModel.availableTrustBalance = 0;
      this.formlyModel = { ...this.formlyModel };
      return of(true);
    }
    return this._apiService
      .get(API_Config.trustFunds.getAllocationCodes, { trustAccountId: id })
      .pipe(
        catchError(() => of({ result: { balance: 0 } })),
        tap((res: any) => {
          const bal = Number(res?.result?.balance ?? 0) || 0;

          this.trustAccountBalance = bal;
          this.formlyModel.availableTrustBalance = bal;

          try {
            this.formly.patchValue({ availableTrustBalance: bal }, { emitEvent: false });
          } catch {}

          this.formlyModel = { ...this.formlyModel };
        }),
      );
  }

  loadMatterData(matterId: string | null) {
    const mid = matterId ? String(matterId) : null;

    if (!mid) {
      this.matterInfo = null;
      this.matterTrustBalance = 0;
      this.bills = [];
      return of(true);
    }

    const matterBalance$ = this._apiService
      .get(API_Config.trustFunds.getMatterTrustBalance, { matterId: mid })
      .pipe(catchError(() => of({ result: { currentTrustBalance: 0 } })));
    const outstandingBills$ = this._apiService
      .get(API_Config.billing.create, { matterId: mid })
      .pipe(catchError(() => of({ result: [] })));

    const matterInfo$ = this._apiService
      .get(API_Config.matters.getMatterCodeByMatterId, { matterId: mid })
      .pipe(catchError(() => of({ result: null })));

    return combineLatest({ matterBalance: matterBalance$, bills: outstandingBills$, info: matterInfo$ }).pipe(
      tap(({ matterBalance, bills, info }: any) => {
        this.matterTrustBalance = Number(matterBalance?.result?.currentTrustBalance ?? 0) || 0;

        this.matterInfo = {
          matterCode: info?.result?.matterCode ?? info?.result?.code ?? undefined,
          client: info?.result?.clientName ?? undefined,
          responsibleLawyer: info?.result?.responsibleLawyer ?? undefined,
          trustBalance: this.matterTrustBalance,
        };

        const rows = (bills?.result || []).map((b: any) => {
          const paid = Number(b?.paid ?? 0) || 0;
          const totalBill = Number(b?.totalBill ?? b?.total ?? 0) || 0;
          const outstanding = Number(
            b?.outstanding ?? (totalBill - paid)
          ) || 0;

          const iso = b?.date ?? b?.billDate ?? '';
          const d = iso ? new Date(iso) : null;
          const date = d && !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : String(iso || '');

          return {
            id: String(b?.id ?? b?.billId ?? ''),
            billNo: String(b?.billNo ?? b?.code ?? b?.id ?? ''),
            date,
            totalBill,
            paid,
            outstanding,
            selected: false,
            transferAmount: 0,
          } as BillRow;
        });

        this.bills = rows.sort((a: { date: any; }, b: { date: any; }) => (a.date || '').localeCompare(b.date || ''));
      }),
    );
  }


  toggleBill(row: BillRow, checked: boolean) {
    row.selected = checked;

    if (checked) {
      if (!row.transferAmount || row.transferAmount <= 0) {
        row.transferAmount = row.outstanding;
      }
      this.clampToMatterBalance(row);
    } else {
      row.transferAmount = 0;
    }

    this.bills = [...this.bills];
  }

  payFull(row: BillRow) {
    row.selected = true;
    row.transferAmount = row.outstanding;
    this.clampToMatterBalance(row);
    this.bills = [...this.bills];
  }

  onTransferAmountInput(row: BillRow, raw: any) {
    const v = Number(raw ?? 0) || 0;
    row.transferAmount = Math.max(0, Math.min(v, row.outstanding));
    row.selected = row.transferAmount > 0;
    this.clampToMatterBalance(row);
    this.bills = [...this.bills];
  }

  payAllOldestFirst() {
    let remaining = this.matterTrustBalance;

    for (const r of this.bills) {
      if (remaining <= 0) {
        r.selected = false;
        r.transferAmount = 0;
        continue;
      }
      const amt = Math.min(r.outstanding, remaining);
      r.selected = amt > 0;
      r.transferAmount = amt;
      remaining -= amt;
    }

    this.bills = [...this.bills];
  }

  private clampToMatterBalance(lastEdited?: BillRow) {
    const total = this.totalTransfer;
    if (total <= this.matterTrustBalance) return;
    if (!lastEdited) return;

    const overflow = total - this.matterTrustBalance;
    lastEdited.transferAmount = Math.max(0, lastEdited.transferAmount - overflow);
    lastEdited.selected = lastEdited.transferAmount > 0;
  }


  get selectedBills(): BillRow[] {
    return this.bills.filter((b) => b.selected && Number(b.transferAmount || 0) > 0);
  }

  get numberOfBills(): number {
    return this.selectedBills.length;
  }

  get totalTransfer(): number {
    return this.selectedBills.reduce((acc, b) => acc + Number(b.transferAmount || 0), 0);
  }

  get balanceAfterTransfer(): number {
    return (Number(this.matterTrustBalance || 0) - this.totalTransfer) || 0;
  }

  get canSubmit(): boolean {
    if (this.formly.invalid) return false;
    if (!this.formlyModel?.fromTrustAccountId) return false;
    if (!this.formlyModel?.toGeneralAccountId) return false;
    if (!this.formlyModel?.transferDate) return false;
    if (!this.formlyModel?.matterId) return false;
    if (this.totalTransfer <= 0) return false;
    if (this.totalTransfer > this.matterTrustBalance) return false;
    return true;
  }


  override onSubmit(): void {
    this.formlyOptions.formState.isSubmitted = true;

    if (!this.canSubmit) {
      this.formly.markAllAsTouched();
      return;
    }

    const payload = {
      fromTrustAccountId: String(this.formlyModel.fromTrustAccountId),
      toGeneralAccountId: String(this.formlyModel.toGeneralAccountId),
      transferDate: new Date(this.formlyModel.transferDate).toISOString(),
      referenceNo: String(this.formlyModel.referenceNo ?? ''),
      memo: String(this.formlyModel.memo ?? ''),
      matterId: String(this.formlyModel.matterId),
      bills: this.selectedBills.map((b) => ({
        billId: b.id,
        amount: String(b.transferAmount),
      })),
    };

  this.submitLoading = true;
    this._apiService
      .post(API_Config.trustFunds.trustToGeneralTransfer, payload)
      .pipe(
        finalize(() => (this.submitLoading = false)),
        this._unsubscribe.takeUntilDestroy(),
      )
      .subscribe({
        next: (res: ApiRes) => {
          if (res?.isSuccess) {
            this._toastrNotifiService.displaySuccess(res?.message || 'Transfer completed');
          } else {
            this._toastrNotifiService.displayError(res?.message || 'Failed');
          }
        },
        error: (err: any) => {
          this._toastrNotifiService.displayError(err?.error?.message || 'Failed');
        },
      });
  }
}