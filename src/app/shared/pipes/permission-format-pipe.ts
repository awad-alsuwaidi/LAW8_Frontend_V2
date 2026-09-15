import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'permissionFormat',
})
export class PermissionFormatPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
