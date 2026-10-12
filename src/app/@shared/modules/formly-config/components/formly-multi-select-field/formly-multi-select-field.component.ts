import { Component, OnInit } from '@angular/core';
import { FieldTypeConfig } from '@ngx-formly/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-multi-select-field',
  templateUrl: './formly-multi-select-field.component.html',
  styleUrl: './formly-multi-select-field.component.scss'
})
export class FormlyMultiSelectFieldComponent extends FieldType<FieldTypeConfig> implements OnInit {

  optionsArr: any = []
  ngOnInit(): void {
    if (this.props['optionsArr']) {
      this.optionsArr = this.props['optionsArr'];
    }
    // if(!this.props['selectedObj'] && this.formControl.value){
    //   this.props['selectedObj']=this.formControl.value;
    // }
  }
  change(e?: any) {
    if (this.props['onChange']) this.props['onChange'](e, this.field)
  }

}
