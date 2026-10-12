import {
  Component,
  inject,
  Input,
  OnInit,
  output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { combineLatest, finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';

@Component({
  selector: 'app-recieve-payment-editor-reference',
  standalone: true,
  imports: [FormlyConfigModule],
  templateUrl: './recieve-payment-editor-reference.component.html',
  styleUrl: './recieve-payment-editor-reference.component.scss',
})
export class RecievePaymentEditorReferenceComponent implements OnInit {
  _apiService = inject(ApiService);
  _languageService = inject(LanguageService);
  _toastrNotifiService = inject(ToastrNotifiService);
  _unsubscribe = inject(UnsubscribeService);

  @Input() formly!: FormGroup;
  @Input() model!: any;
  onMatterChange = output();
  fields: any;
  lookupsData: any;
  isLoading: boolean = false;
  ngOnInit(): void {
    this.getLookupsData();
  }

  getLookupsData(): void {
    this.isLoading = true;
    combineLatest({
      matter: this._apiService.get(API_Config.general.getMatterCodes),
      client: this._apiService.get(API_Config.general.getClients),
      invoice: this._apiService.get(API_Config.general.getInvoicesList),
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
  initForm() {}
  getInvoiceList() {
    const params = {
      MatterId: this.model?.matterId,
      ClientId: this.model?.clientId?.id,
      InvoiceId: this.model?.invoiceId,
    };
    this._apiService
      .get(API_Config.recievePayment.getInvoiceList, params)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res.isSuccess) {
            const invoicesData = res.result.map((invoice: any) => ({
              ...invoice,
              date: invoice.date
                ? new Date(invoice.date).toISOString().split('T')[0]
                : '',
            }));
            this.model = { ...this.model, invoicesDetails: invoicesData };
          }
        },
      });
  }
}
