import { AbstractControl, FormControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';

export function arabicLettersValidator(control: AbstractControl): any {
  return !control.value || /^[\u0621-\u064A\s\/p{N}\s0-9]+$/.test(control.value)
    ? null
    : { arabicLetters: true };
}

export function englishLettersValidator(control: AbstractControl): any {
  return !control.value ||
    /^[~`!@#$%^&*()_+=[\]\\{}|;':",.\/<>?a-zA-Z\s0-9-]+$/.test(control.value)
    ? null
    : { englishLetters: true };
}

export function emailValidator(control: AbstractControl): any {
  return !control.value ||
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(control.value)
    ? null
    : { email: true };
}
export function passwordValidator(control: AbstractControl): any {
  return !control.value ||
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(
      control.value
    )
    ? null
    : { password: true };
}
export function urlValidator(control: AbstractControl): any {
  return !control.value || /^(ftp|http|https):\/\/[^ "]+$/.test(control.value)
    ? null
    : { url: true };
}

// export function phoneNumberValidator(control: AbstractControl): any {
//   return !control.value || /^[0-9]{3}\s[0-9]{9}$/.test(control.value) ? null : { 'phone': true };
// }

export function phoneNumberValidator(control: AbstractControl): any {
  const egyptPhoneRegex = /^\+20(10|11|12|15)[0-9]{8}$/;
  const uaePhoneRegex = /^\+971(50|52|54|55|56|58)[0-9]{7}$/;

  return !control.value ||
    egyptPhoneRegex.test(control.value) ||
    uaePhoneRegex.test(control.value)
    ? null
    : { phone: true };
}

// export function dateRangeValidator(control: AbstractControl,field:FormlyFieldConfig,options:any={}): any {
//   if (!control.value) return null;

//   let startDate ;
//   let endDate;
//   if(options?.startDate && options?.endDate){
//     startDate = control.value[options?.startDate];
//     endDate = control.value[options?.endDate];
//   }else{
//     startDate = control.value?.startDate;
//     endDate = control.value?.endDate;
//   }

//   console.log('Start Date:', startDate);
//   console.log('End Date:', endDate);
//   if(!startDate || !endDate) return null;

//   if(startDate>endDate) return { 'dateRange': true };
//   // const form = control.parent;
//   // if (!form) return null;

//   // const fromDate = form.get('fromDate')?.value;
//   // const toDate = form.get('toDate')?.value;

//   // if (!fromDate || !toDate) return null;

//   // const fromDateObj = new Date(fromDate);
//   // const toDateObj = new Date(toDate);

//   // if (fromDateObj > toDateObj) {
//   //   return { 'dateRange': true };
//   // }

//   return null;
// }

export function dateRangeValidator(
  control: AbstractControl,
  field: FormlyFieldConfig,
  options: any = {}
): any {
  console.log('control:', control); // yyyy-MM-dd
  console.log('options:', options); // yyyy-MM-dd
  if (!control.value) return null;

  let startDate: any;
  let endDate: any;
  console.log('Control Value:', control.value);
  console.log('Options:', options);

  if (options?.startDate && options?.endDate) {
    startDate = control.value[options.startDate];
    endDate = control.value[options.endDate];
  } else {
    startDate = control.value?.startDate;
    endDate = control.value?.endDate;
  }

  if (!startDate || !endDate) return null;

  // 🔹 دالة لتوحيد التاريخ في شكل yyyy-MM-dd بدون وقت
  const normalizeDate = (date: any): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0); // نمسح الوقت
    return d;
  };

  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);

  if (start > end) {
    return { dateRange: true };
  }

  return null;
}
