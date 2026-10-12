import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appFileIcon]',
  standalone: true
})
export class FileIconDirective implements OnChanges {

  @Input() appFileIcon!: string;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnChanges(): void {
    if (this.appFileIcon) {
      this.el.nativeElement.src = this.getIconForFile(this.appFileIcon);
    }
  }

  private getIconForFile(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'assets/images/icons/pdf.svg';
      case 'doc':
      case 'docx': return 'assets/images/icons/doc.svg';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp': return 'assets/images/icons/img.svg';
      default: return 'assets/images/icons/file.svg';
    }
  }
}
