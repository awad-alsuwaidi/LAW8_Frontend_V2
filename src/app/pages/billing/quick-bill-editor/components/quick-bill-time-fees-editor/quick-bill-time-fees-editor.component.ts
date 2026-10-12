import { Component, inject, Input, input, InputSignal, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LanguageService } from 'src/app/@core/services';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { quickBillTimeFeesEditorFields } from './quick-bill-time-fees-editor-formly.config';

@Component({
  selector: 'app-quick-bill-time-fees-editor',
  standalone: true,
  imports: [FormlyConfigModule],
  templateUrl: './quick-bill-time-fees-editor.component.html',
  styleUrl: './quick-bill-time-fees-editor.component.scss'
})
export class QuickBillTimeFeesEditorComponent implements AfterViewInit {

  _languageService = inject(LanguageService);

  @Input() formly!: FormGroup;
  model: InputSignal<any> = input();
  fields: any;

  @Output() amountChanged = new EventEmitter<number>();

  ngAfterViewInit(): void {
    setTimeout(() => {
      const control = this.formly.get('amount');
      if (control) {
        console.log('%c[Child] Amount control found', 'color:green');
        this.amountChanged.emit(Number(control.value) || 0);
        control.valueChanges.subscribe((val) => {
          console.log('%c[Child] Amount changed ->', 'color:orange', val);
          this.amountChanged.emit(Number(val) || 0);
        });
      } else {
        console.warn('%c[Child] Amount control NOT found in formly', 'color:red');
      }
    }, 500);
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.fields = quickBillTimeFeesEditorFields(this);
  }
}
