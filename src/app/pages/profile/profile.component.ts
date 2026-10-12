import {
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { ChangePasswordEditorComponent } from './components/change-password-editor/change-password-editor.component';
import { DialogService } from 'primeng/dynamicdialog';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { ApiService } from 'src/app/@core/api/api.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { UserProfileDto } from './interface/user-profile.interface';
import { ProfileService } from './services/profile.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/@core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from 'src/app/@core/services/language.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [SharedButtonComponent, FormsModule, TranslateModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  _authService = inject(AuthService);
  private _languageService = inject(LanguageService);
  protected _router = inject(Router);
  protected _route = inject(ActivatedRoute);
  private _dialogService = inject(DialogService);
  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _profileService = inject(ProfileService);
  protected user!: UserProfileDto;
  private userPlaceholderKeys = [
    'Attachment',
    'userName',
    'email',
    'mobileNo',
    'mobile2',
    'role',
    'team',
    'defUsrId',
    'address',
    'zipCode',
    'country',
    'city',
    'state',
  ];
  percentage: number = 0;

  radius: number = 61;
  strokeDashArray: number = 2 * Math.PI * this.radius;
  strokeDashOffset: number = this.strokeDashArray * (1 - this.percentage / 100);
  ngOnInit(): void {
    this.getProfileData();
  }
  getProfileData() {
    this._apiService
      .get(API_Config.profile.get)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) {
            this.user = res.result;

            this.percentage = this.calculateProfileCompletionPercentage(
              this.user,
              this.userPlaceholderKeys
            );
            this.updateProgress();
            console.log('percentage', this.percentage);
            this._profileService.updateProfileData(this.user);
          }
        },
      });
  }

  openChangePasswordEditor() {
    this._dialogService.open(ChangePasswordEditorComponent, {
      header: this._languageService.getTransValue('auth.changePassword'),
    });
  }

  updateProgress(): void {
    this.strokeDashOffset = this.strokeDashArray * (1 - this.percentage / 100);
  }
  calculateProfileCompletionPercentage(
    user: Record<string, any>,
    keys: string[]
  ): number {
    const totalKeys = keys.length;
    let filledKeys = 0;

    keys.forEach((key) => {
      const value = user[key];
      if (value !== undefined && value !== null && value !== '') {
        filledKeys++;
      }
    });
    console.log('totalKeys', totalKeys);
    console.log('filledKeys', filledKeys);
    return Math.round((filledKeys / totalKeys) * 100);
  }
  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
