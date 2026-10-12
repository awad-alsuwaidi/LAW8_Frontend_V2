import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserDetailsService {
  private userData: WritableSignal<any> = signal<any>({} as any);
  getUserData() {
    return this.userData()
  }

  updateUserData(value: any) {
    this.userData.update(() => value);
  }
}
