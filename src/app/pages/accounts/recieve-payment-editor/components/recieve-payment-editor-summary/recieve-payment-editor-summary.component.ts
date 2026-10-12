import { Component, inject, Input, input, InputSignal, OnInit, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApiService } from 'src/app/@core/api/api.service';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';

@Component({
  selector: 'app-recieve-payment-editor-summary',
  standalone: true,
  imports: [FormlyConfigModule],
  templateUrl: './recieve-payment-editor-summary.component.html',
  styleUrl: './recieve-payment-editor-summary.component.scss'
})
export class RecievePaymentEditorSummaryComponent implements OnInit {
  _apiService = inject(ApiService);
  _languageService = inject(LanguageService);
  _toastrNotifiService = inject(ToastrNotifiService);
  _unsubscribe = inject(UnsubscribeService)

  @Input() formly!: FormGroup;
  model: InputSignal<any> = input();
  onMatterChange = output()
  fields: any;
  lookupsData: any;
  isLoading: boolean = false;
  ngOnInit(): void {
    this.initForm()
  }
  initForm() {
  }

}
