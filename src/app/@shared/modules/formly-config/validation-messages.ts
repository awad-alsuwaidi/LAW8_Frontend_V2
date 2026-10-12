import { TranslateService } from "@ngx-translate/core";

export function formlyValidationConfig(translate: TranslateService) {
  return {
    validationMessages: [
      {
        name: 'required',
        message() {
          return translate.stream('validation.required');
        },
      },
      {
        name: 'arabicLetters',
        message() {
          return translate.stream('validation.arabicLetters');
        },
      },
      {
        name: 'englishLetters',
        message() {
          return translate.stream('validation.englishLetters');
        },
      },
      {
        name: 'email',
        message() {
          return translate.stream('validation.email');
        },
      },
      {
        name: 'url',
        message() {
          return translate.stream('validation.webSiteUrlPattern');
        },
      },
      {
        name: 'phone',
        message() {
          return translate.stream('validation.phone');
        },
      },
      {
        name: 'maxlength',
        message: (error: any) => {
          return translate.stream('validation.maxlength', {
            max: error?.requiredLength,
          });
        },
      },
      {
        name: 'dateRange',
        message() {
          return translate.stream('validation.dateRange');
        },
      }


    ],
  };
}
