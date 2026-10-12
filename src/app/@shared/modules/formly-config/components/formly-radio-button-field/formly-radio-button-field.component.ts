import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-radio-button-field',
  templateUrl: './formly-radio-button-field.component.html',
  styleUrl: './formly-radio-button-field.component.scss'
})
export class FormlyRadioButtonFieldComponent extends FieldType<FieldTypeConfig> {
  optionsArr: any = []

  ngOnInit(): void {
    if (this.props.options) {
      this.optionsArr = this.props.options;
    }

  }
  onChange(e: any) {
    if (this.props['onChange']) this.props['onChange'](e, this.field)
  }
}
