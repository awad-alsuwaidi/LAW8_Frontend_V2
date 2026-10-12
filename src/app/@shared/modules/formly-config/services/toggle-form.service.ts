import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToggleFormService {

  toggleEdit:WritableSignal<boolean> = signal<boolean>(true);
 
 
  setToggleEdit(value:boolean){
    this.toggleEdit.set(value)
  }

  getToggleEdit(){
    return this.toggleEdit()
  }

  updateToggleEdit(value:boolean){
    this.toggleEdit.update(() => value);
  }
}
