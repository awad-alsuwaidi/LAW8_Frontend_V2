import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, searchText: string): SafeHtml {
    if (!searchText || !value) {
      return value;
    }

    const words = searchText
      .trim()
      .split(/\s+/) 
      .filter((w) => w.length > 0);

    const regex = new RegExp(`(${words.join('|')})`, 'gi');

    const highlighted = value.replace(
      regex,
      (match) => `<span class="bg-yellow-400 text-primary font-semibold">${match}</span>`
    );

    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
