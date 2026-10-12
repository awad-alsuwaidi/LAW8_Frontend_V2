import { Directive, AfterViewInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: 'body',
  standalone: true
})
export class ArabicNumbersDirective implements AfterViewInit {

  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit() {
    const observer = new MutationObserver(() => {
      const lang = this.document.documentElement.lang;
      if (lang !== 'ar') return;

      const elements = this.document.querySelectorAll('.p-datepicker td span');

      elements.forEach((el: any) => {
        const text = el.textContent?.trim();
        if (/^\d+$/.test(text)) {
          el.textContent = text.replace(/\d/g, (d: string | number) => '٠١٢٣٤٥٦٧٨٩'[+d]);
        }
      });
    });

    observer.observe(this.document.body, { childList: true, subtree: true });
  }
}
