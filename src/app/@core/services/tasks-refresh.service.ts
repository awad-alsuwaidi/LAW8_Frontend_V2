import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TasksRefreshService {

  private refreshSource = new Subject<void>();
  refresh$ = this.refreshSource.asObservable();

  trigger() {
    this.refreshSource.next();
  }
}