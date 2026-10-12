// import { Component } from '@angular/core';
// import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

// @Component({
//   selector: 'app-formly-input-mask',
//   templateUrl: './formly-input-mask.component.html',
//   styleUrl: './formly-input-mask.component.scss'
// })
// export class FormlyInputMaskComponent extends FieldType<FieldTypeConfig> {
//   currentMask = "(999) 999999999";

//   onInputChange(event: any) {
//     const value = this.formControl.value.replace(/\D/g, ''); // بس الأرقام
//     const valueWithoutUnderscroe = this.formControl.value?.replace(/_/g, '')
//     console.log(valueWithoutUnderscroe)
//       setTimeout(()=>{

//         this.formControl.setValue(valueWithoutUnderscroe)
//       })

//     // this.formControl.setValue(value)
//     // console.log(this.formControl.value)
//     // if (value.length === 11) { // 3 أرقام + 8 أرقام
//     //   this.currentMask = "(999) 99999999";
//     //   setTimeout(()=>{

//     //     this.formControl.setValue(valueWithoutUnderscroe)
//     //   })
//     //   console.log(valueWithoutUnderscroe)
//     // }
//     // this.formControl.setValue(valueWithoutUnderscroe)
//   }
// }

import { Component } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-input-mask',
  templateUrl: './formly-input-mask.component.html',
  styleUrl: './formly-input-mask.component.scss',
})
export class FormlyInputMaskComponent extends FieldType<FieldTypeConfig> {
  currentMask = '(999) 9999999999';

  onInputChange(event: any) {
    const currentValue = this.formControl.value;

    if (!currentValue) return;

    // استخرج الأرقام بس من القيمة
    const digitsOnly = currentValue.replace(/\D/g, '');

    // تحقق إن عندك 11 رقم (3 + 8)
    if (digitsOnly.length === 11) {
      // كون الرقم بالشكل الصحيح: (999) 99999999
      const formattedValue = `(${digitsOnly.substring(
        0,
        3
      )}) ${digitsOnly.substring(3, 11)}`;

      // حط القيمة الجديدة بدون underscore
      setTimeout(() => {
        this.formControl.setValue(formattedValue);
      });
    } else if (digitsOnly.length === 12) {
      // لو عندك 12 رقم (3 + 9)
      const formattedValue = `(${digitsOnly.substring(
        0,
        3
      )}) ${digitsOnly.substring(3, 12)}`;

      setTimeout(() => {
        this.formControl.setValue(formattedValue);
      });
    } else {
      // لو العدد مش 11 أو 12، امسح الـ underscore بس
      const valueWithoutUnderscore = currentValue.replace(/_/g, '');

      setTimeout(() => {
        this.formControl.setValue(valueWithoutUnderscore);
      });
    }
  }

  onInputBlur() {
    const currentValue = this.formControl.value;

    if (!currentValue) return;

    const digitsOnly = currentValue.replace(/\D/g, '');
    this.formControl.setValue(digitsOnly);
  }

  // عرض الرقم المنسق فقط في وضع القراءة
  formatPhoneNumber(value: string): string {
    if (!value) return '';

    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length >= 11) {
      return `(${digitsOnly.substring(0, 3)}) ${digitsOnly.substring(3)}`;
    }
    return digitsOnly;
  }
}
