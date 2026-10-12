import { Injectable, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private refreshData:WritableSignal<boolean> = signal<boolean>(false);
  private client:WritableSignal<any> = signal<any>({});

  client$=new BehaviorSubject({})

  getClient(){
    return this.client()
  }

  updateClient(value:any){
    this.client.update(() => value);
  }

  getRefreshData(){
    return this.refreshData()
  }

  updateRefreshData(value:boolean){
    this.refreshData.update(() => value);
  }
}
