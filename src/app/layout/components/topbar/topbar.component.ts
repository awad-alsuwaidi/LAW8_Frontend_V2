import {
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
  ViewChild,
  viewChild,
} from '@angular/core';
import { AppUserComponent } from './app-user/app-user.component';
import { NavbarMobileComponent } from './navbar-mobile/navbar-mobilecomponent';
import { MenuService } from '../../services/menu.service';
import { SharedLanguageComponent } from '@shared/components/shared-language/shared-language.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { AppAdvancedSearchComponent } from './app-advanced-search/app-advanced-search.component';
import { AppNotificationComponent } from './app-notification/app-notification.component';
import { DialogService } from 'primeng/dynamicdialog';
import { TopbarTimesheetEditorComponent } from './topbar-timesheet-editor/topbar-timesheet-editor.component';
import { TopbarTimerComponent } from './topbar-timer/topbar-timer.component';
@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  standalone: true,
  imports: [
    AppUserComponent,
    NavbarMobileComponent,
    SharedLanguageComponent,
    CommonModule,
    SharedModule,
    AppAdvancedSearchComponent,
    AppNotificationComponent,
    TopbarTimerComponent,
  ],
})
export class TopbarComponent implements OnInit {
  _dialogService = inject(DialogService);

  constructor() {}
  _menuService = inject(MenuService);
  ngOnInit() {}
  public toggleMobileMenu(): void {
    this._menuService.showMobileMenu = true;
  }

  onToggleSidebar() {
    this._menuService.toggleSidebar();
  }

  @Output() refreshTimesheet = new EventEmitter<void>();

  onStopTimer(event: any) {
    const ref = this._dialogService.open(TopbarTimesheetEditorComponent, {
      header: 'Set Time',
      width: '40vw',
      data: { formValue: event },
    });

    ref.onClose.subscribe((isUpdated) => {
      if (isUpdated) {
        this.refreshTimesheet.emit(); 
      }
    });
  }
}
