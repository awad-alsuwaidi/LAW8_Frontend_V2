import { Component, inject, OnInit } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { LanguageService } from '@core/services';

@Component({
  selector: 'app-formly-input-field',
  templateUrl: './formly-input-field.component.html',
  styleUrls: ['./formly-input-field.component.scss'],
})
export class FormlyInputFieldComponent extends FieldType<FieldTypeConfig> implements OnInit {

  _languageService = inject(LanguageService);
  showPassword!: boolean;
  inputType?: string = 'input'
  ngOnInit(): void {
    this.inputType = this.props['type']

  }
  onInput(e: any) {
    if (this.props['input']) this.props['input'](e)
  }
  onKeyUp(e: any) {
    if (this.props['onKeyUp']) this.props['onKeyUp'](e.target.value)
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
    this.inputType = this.showPassword ? 'text' : 'password'
  }
}
