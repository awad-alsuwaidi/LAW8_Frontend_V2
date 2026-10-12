import { Component, effect, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ClickOutsideDirective } from '../../../../@shared/directives/click-outside.directive';
import { SharedModule } from '@shared/shared.module';
import { AuthService } from 'src/app/@core/services';
import { UserProfileDto } from 'src/app/pages/profile/interface/user-profile.interface';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { DashboardModeService } from 'src/app/pages/dashboard/Service/dashboard-mode.service';
@Component({
  selector: 'app-user',
  templateUrl: './app-user.component.html',
  styleUrls: ['./app-user.component.scss'],
  standalone:true,
  imports:[
    MenuModule,
    SharedModule,
    CommonModule,
    ClickOutsideDirective,
    NgOptimizedImage
  ],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          opacity: 1,
          transform: 'translateY(0)',
          visibility: 'visible',
        }),
      ),
      state(
        'closed',
        style({
          opacity: 0,
          transform: 'translateY(-20px)',
          visibility: 'hidden',
        }),
      ),
      transition('open => closed', [animate('0.2s')]),
      transition('closed => open', [animate('0.2s')]),
    ]),
  ],
})
export class AppUserComponent implements OnInit,OnDestroy{
  dashboardMode?: 1 | 2 | 3;

  @Output() dashboardModeChange = new EventEmitter<1 | 2 | 3>();
_modeService = inject(DashboardModeService);
changeMode(mode: 1 | 2 | 3) {
  this._modeService.setMode(mode);
  this.isOpen = false;
  // this.saveDefaultDashboardMode(mode); 
}
closeAndRun(action: () => void) {
  this.isOpen = false;
  action();
}

saveDefaultDashboardMode(mode: 1 | 2 | 3) {
  const formData = new FormData();
  formData.append('dashBoardTempletId', String(mode)); 

  this._apiService
    .post(API_Config.profile.update, formData)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res: ApiRes) => {
        if (res?.isSuccess) {
          this._authService.updateUserProfile(res.result);
          this._modeService.setMode(mode);
        }
      },
    });
}

get currentDashboardMode(): 1 | 2 | 3 {
  return this._modeService.getCurrentMode();
}

  public isOpen = false;
  _authService=inject(AuthService);
  _apiService=inject(ApiService)
_unsubscribe=inject(UnsubscribeService)
userProfile!: UserProfileDto;

isLoading = true;

constructor() {
  effect(() => {
    const user = this._authService.getUserProfile();
    this.userProfile = user;
    this.isLoading = !user?.id; 
  });
}

toggleMenu() {
  if (!this.userProfile?.id) return; 
  this.isOpen = !this.isOpen;
}
  ngOnInit(): void {
    this.getProfileData()
  }
  
  getProfileData() {
  this._apiService.get(API_Config.profile.get)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res: ApiRes) => {
        if (!res?.isSuccess) return;
        this.userProfile = { ...res.result };
        this._authService.updateUserProfile(res.result);
      },
      error: (err) => console.error('API error:', err)
    });
}

get hasUserData(): boolean {
  return !!this.userProfile?.name; 
}

  ngOnDestroy(): void {
    this._unsubscribe.destroy()
  }

}
