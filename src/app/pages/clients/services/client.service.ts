import { Injectable, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private refreshData: WritableSignal<boolean> = signal<boolean>(false);
  private client: WritableSignal<any> = signal<any>({});

  client$ = new BehaviorSubject({});
  private _clientCode: WritableSignal<string> = signal<string>('');

  getClient() {
    return this.client();
  }
  setClientCode(code: string): void {
    this._clientCode.set(code ?? '');
  }
  updateClient(value: any) {
    this.client.update(() => value);
  }

  getRefreshData() {
    return this.refreshData();
  }

  updateRefreshData(value: boolean) {
    this.refreshData.update(() => value);
  }
  getClientCode(): string {
    return this._clientCode();
  }
  clearClientCode(): void {
    this._clientCode.set('');
  }
}
