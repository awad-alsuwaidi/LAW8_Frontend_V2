import { Component, OnInit } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-input-btn-field',
  templateUrl: './formly-input-btn-field.component.html',
  styleUrl: './formly-input-btn-field.component.scss'
})
export class FormlyInputBtnFieldComponent extends FieldType<FieldTypeConfig>{
  fullWidth!: boolean;
  onInput(e:any){
    if(this.props['input']) this.props['input'](e)
  }
  toggleWidth(){
    this.fullWidth = !this.fullWidth;
    this.props['btnClass']=this.fullWidth?'!p-0 text-primary':'!p-0'
  }
}
