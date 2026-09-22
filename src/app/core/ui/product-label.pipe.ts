import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../../features/auth/services/Translation.service';

export interface ProductRef {
  productCode?: string | null;
  productName?: string | null;
  productNameAr?: string | null;
}

/** Product display name in the UI language, falling back to the English name, then the code. */
@Pipe({ name: 'productLabel', standalone: true, pure: false })
export class ProductLabelPipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(ref: ProductRef | null | undefined): string {
    if (!ref) return '';
    const ar = this.i18n.getCurrentLanguage() === 'ar' ? ref.productNameAr : null;
    return ar || ref.productName || ref.productCode || '';
  }
}
