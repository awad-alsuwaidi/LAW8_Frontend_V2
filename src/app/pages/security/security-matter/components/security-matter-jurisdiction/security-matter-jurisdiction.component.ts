import { Component, effect, inject, input, OnDestroy } from '@angular/core';
import { PickListModule } from 'primeng/picklist';
import { finalize } from 'rxjs';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { LanguageService, ToastrNotifiService } from 'src/app/@core/services';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { SharedModule } from 'src/app/@shared/shared.module';

@Component({
  selector: 'app-security-matter-jurisdiction',
  standalone: true,
  imports: [
    PickListModule,
    SharedModule,
    SharedButtonComponent
  ],
  templateUrl: './security-matter-jurisdiction.component.html',
  styleUrl: './security-matter-jurisdiction.component.scss'
})
export class SecurityMatterJurisdictionComponent implements OnDestroy {


  private _apiService = inject(ApiService);
  private _unsubscribe = inject(UnsubscribeService);
  private _languageService = inject(LanguageService);
  private _toastrNotifiService = inject(ToastrNotifiService)

  userId = input<string>('');
  isSubmitted!: boolean;
  source: any[] = [];
  target: any[] = [];

  signalEffect = effect(() => {
    if (this.userId()) {
      this.getByUser();
      this.getList()
    }
  });
  getList() {
    this._apiService
      .get(API_Config.MatterJurisdictionSecurity.get)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          this.source = res['result'];
        },
      });
  }
  getByUser() {
    this._apiService
      .get(API_Config.MatterJurisdictionSecurity.getById, { userId: this.userId() })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          this.target = res['result'];
          this.source = this.source.filter(
            (sourceItem) =>
              !this.target.some((targetItem) => targetItem.id === sourceItem.id)
          );
        },
      });
  }
  onSubmit() {
    let model = {
      userId: this.userId(),
      ids: this.target.map((item) => item.id),
    };
    this.isSubmitted = true;
    this._apiService
      .post(API_Config.MatterJurisdictionSecurity.update, model)
      .pipe(
        finalize(() => this.isSubmitted = false),
        this._unsubscribe.takeUntilDestroy()
      )
      .subscribe({
        next: (res: ApiRes) => {
          const text = this._languageService.getTransValue(
            'messages.updateSuccessfully'
          );
          this._toastrNotifiService.displaySuccess(text);
        },
      });
  }
  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}

