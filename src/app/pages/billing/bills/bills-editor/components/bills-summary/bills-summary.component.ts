import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  Input,
  InputSignal,
  output,
} from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { SharedService } from 'src/app/@shared/services/shared.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';

@Component({
  selector: 'app-bills-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bills-summary.component.html',
  styleUrl: './bills-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillsSummaryComponent {
  _languageService = inject(LanguageService);
  _toastrNotifiService = inject(ToastrNotifiService);
  _sharedService = inject(SharedService);
  _unsubscribeService = inject(UnsubscribeService);

  data: InputSignal<any> = input();

  showDiscount = false;
  discountPercentage: number | null = null;
  discountAmount: number | null = null;
  appliedDiscount = 0;
  discountExplanation: string = '';

  toggleDiscount() {
    this.showDiscount = !this.showDiscount;
  }

  get grandTotalAfterDiscount() {
    return (
      this.totalAfterDiscount +
      this.taxValue +
      (this.data()?.totalExpenses || 0) +
      (this.data()?.taxe || 0)
    );
  }
  get hasAppliedDiscount() {
    return this.appliedDiscount > 0;
  }
emitDiscount() {
  this.applyDiscountEvent.emit({
    discount: this.discountValue,
    discountTypeId: 2,
    explanation: this.discountExplanation,
    totalAfterDiscount: this.totalAfterDiscount,
    taxes: this.taxValue,
    grandTotal: this.grandTotal,
  });
}

onPercentageInput() {
  const total = Number(this.data()?.totalFees || 0);
  const pct = Number(this.discountPercentage || 0);

  this.discountAmount = total ? (pct / 100) * total : 0;
  this.emitDiscount();
}

onAmountInput() {
  const total = Number(this.data()?.totalFees || 0);
  const amount = Number(this.discountAmount || 0);

  this.discountPercentage = total ? (amount / total) * 100 : 0;
  this.emitDiscount();
}


  get discountValue(): number {
    const total = this.data()?.totalFees || 0;

    if (this.discountAmount) return this.discountAmount;
    if (this.discountPercentage) return (total * this.discountPercentage) / 100;

    return 0;
  }

  get totalAfterDiscount(): number {
    return (this.data()?.totalFees || 0) - this.discountValue;
  }

  get taxValue(): number {
    return (this.totalAfterDiscount * (this.data()?.taxesFees || 0)) / 100;
  }

  get totalAfterTax(): number {
    return this.totalAfterDiscount + this.taxValue;
  }

  get totalExpensesAfterTax(): number {
    return (this.data()?.totalExpenses || 0) + (this.data()?.taxe || 0);
  }

  get grandTotal(): number {
    return this.totalAfterTax + this.totalExpensesAfterTax;
  }
  applyDiscountEvent = output<any>();
applyDiscount() {
  const discountTypeId = 2;

  this.applyDiscountEvent.emit({
    discount: this.discountValue,
    discountTypeId,
    explanation: this.discountExplanation,
    totalAfterDiscount: this.totalAfterDiscount,
    taxes: this.taxValue,
    grandTotal: this.grandTotal,
  });

  this.showDiscount = false;
}


}
