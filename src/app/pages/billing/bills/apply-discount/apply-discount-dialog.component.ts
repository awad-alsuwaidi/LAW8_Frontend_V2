import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { API_Config } from "src/app/@core/api/api-config/api.config";
import { ApiService } from "src/app/@core/api/api.service";
import { ApiRes } from "src/app/@core/models/apiRes-model";
import { ToastrNotifiService } from "src/app/@core/services";

@Component({
  selector: 'app-apply-discount-dialog',
  standalone: true,
  imports: [ FormsModule],
templateUrl: './apply-discount-dialog.component.html'
})
export class ApplyDiscountDialogComponent {

  bill = this.config.data.billData;  

  model: any = {
    billId: this.config.data.billId,
    discountPercent: null,
    discountValue: 0,
    notes: ''
  };

  constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private api: ApiService,
    private toast: ToastrNotifiService
  ) {}

  onPercentChange() {
    if (!this.bill?.grandTotal) return;
  
    this.model.discountValue =
      (this.bill.grandTotal * (this.model.discountPercent / 100)).toFixed(2);
  }

  onValueChange() {
    if (!this.bill?.grandTotal) return;

    this.model.discountPercent =
      ((this.model.discountValue / this.bill.grandTotal) * 100).toFixed(2);
  }

  save() {
    this.api.post(API_Config.discount.create, this.model)
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
           this.toast.displaySuccess("Discount applied successfully");
            this.ref.close(true);
          }
        }
      });
  }
}
