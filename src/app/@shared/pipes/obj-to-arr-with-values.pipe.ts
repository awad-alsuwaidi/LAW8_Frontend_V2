import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objToArrWithValues',
  standalone: true
})
export class ObjToArrWithValuesPipe implements PipeTransform {

  transform(value: unknown): any {
    if(!value) return [];
    return  Object.values(value).filter(value => value !== undefined && value !== null);
  }

}
