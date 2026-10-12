import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedLanguageComponent } from 'src/app/@shared/components/shared-language/shared-language.component';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { API_Config } from '../../api/api-config/api.config';
import { ApiService } from '../../api/api.service';
import { ApiRes } from '../../models/apiRes-model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-forgetpassword',
  standalone: true,
  imports: [
    TranslateModule,
    SharedLanguageComponent,
    RouterModule,
    NgOptimizedImage,
  ],
  templateUrl: './forgetpassword.component.html',
  styleUrl: './forgetpassword.component.scss',
})
export class ForgetpasswordComponent {
  _router = inject(Router);
    _apiService = inject(ApiService);
    _unsubscribe = inject(UnsubscribeService);
    logoPath!: string;
    defaultLogoPath =
  environment.production
    ? 'assets/images/Logo.svg'
    : 'assets/images/Law8logoDemo.png';
      ngOnInit(): void {
        this.getCompanyLogo();
      }
    
      getCompanyLogo() {
        this._apiService
          .get(API_Config.setting.getLogo)
          .pipe(this._unsubscribe.takeUntilDestroy())
          .subscribe({
            next: (res: ApiRes) => {
              if (res.isSuccess && res.result && res.result.logoPath) {
                this.logoPath = res.result.logoPath;
              } else {
                this.logoPath = this.defaultLogoPath;
              }
            },
            error: (error) => {
              //console.error('Failed to load company logo:', error);
              this.logoPath = this.defaultLogoPath;
            },
          });
      }
    
      onImageError(event: any) {
        event.target.src = this.defaultLogoPath;
      }
}
