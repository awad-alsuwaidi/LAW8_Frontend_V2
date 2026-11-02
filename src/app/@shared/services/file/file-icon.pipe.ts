import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileIcon',
  standalone: true,
})
export class FileIconPipe implements PipeTransform {
  transform(extension: string): string {
    if (!extension) return 'assets/images/icons/file.svg';

    const ext = extension.toLowerCase().replace('.', '');

    switch (ext) {
      case 'pdf':
        return 'assets/images/icons/pdf.svg';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
        return 'assets/images/icons/image.svg';
      case 'doc':
      case 'docx':
        return 'assets/images/icons/word.svg';
      case 'xls':
      case 'xlsx':
        return 'assets/images/icons/excel.svg';
      case 'zip':
      case 'rar':
        return 'assets/images/icons/zip.svg';
      default:
        return 'assets/images/icons/file.svg';
    }
  }
}
