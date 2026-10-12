import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { UsersService } from './services/users.service';
import { UsersViewListComponent } from './users-view-list/users-view-list.component';
import { UsersViewCardComponent } from './users-view-card/users-view-card.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    RouterOutlet,
    UsersViewListComponent,
    UsersViewCardComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent  {

  protected _router = inject(Router)
  private _usersService = inject(UsersService);
  protected dataView!: 'card' | 'list';
  
  signalEffect = effect(() => {
    if (this._usersService.getDataView()) this.dataView = this._usersService.getDataView()
  })
}
