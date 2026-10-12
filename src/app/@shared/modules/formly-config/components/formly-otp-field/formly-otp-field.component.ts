import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { InputOtpModule } from 'primeng/inputotp';

@Component({
  selector: 'app-formly-otp-field',
  standalone: true,
  imports: [InputOtpModule,ReactiveFormsModule],
  templateUrl: './formly-otp-field.component.html',
  styleUrl: './formly-otp-field.component.scss'
})
export class FormlyOtpFieldComponent  extends FieldType<FieldTypeConfig>{

}
