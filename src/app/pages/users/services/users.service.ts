import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private dataView: WritableSignal<'card' | 'list'> = signal<'card' | 'list'>('card');
  getDataView() {
    return this.dataView()
  }

  updateDataView(value: 'card' | 'list') {
    this.dataView.update(() => value);
  }
}
