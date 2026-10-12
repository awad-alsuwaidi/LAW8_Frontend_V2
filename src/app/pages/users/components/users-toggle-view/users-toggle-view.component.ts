import { Component, effect, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { UsersService } from '../../services/users.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';

@Component({
  selector: 'app-users-toggle-view',
  standalone: true,
  imports: [
    SharedButtonComponent
  ],
  templateUrl: './users-toggle-view.component.html',
  styleUrl: './users-toggle-view.component.scss'
})
export class UsersToggleViewComponent implements OnInit {

  selectedView: 'list' | 'card' = 'list';
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _usersService = inject(UsersService);
  private _unsubscribe = inject(UnsubscribeService)
  signalEffect = effect(() => {
    if (this._usersService.getDataView()) {
      this.selectedView = this._usersService.getDataView()
    }
  })
  ngOnInit(): void {
  }
  setView(view: 'list' | 'card') {
    this.selectedView = view;
    this._usersService.updateDataView(view)
    this._router.navigate([], {
      relativeTo: this._route,
      queryParams: { view: this.selectedView }
    })
  }
}
