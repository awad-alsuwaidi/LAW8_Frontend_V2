import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private isJsonLoaded$=signal(false);
  

  set isJsonLoaded(value: boolean) {
    this.isJsonLoaded$.set(value);  
  }
  get isJsonLoaded() : boolean {
    return this.isJsonLoaded$()
  }
  
}
