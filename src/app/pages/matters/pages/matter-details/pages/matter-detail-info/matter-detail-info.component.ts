import {
  Component,
  effect,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedStatusComponent } from 'src/app/@shared/components/shared-status/shared-status.component';
import { CommonModule, DatePipe } from '@angular/common';
import { ChipModule } from 'primeng/chip';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { ApiService } from 'src/app/@core/api/api.service';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiRes } from 'src/app/@core/models/apiRes-model';
import { MatterAddressComponent } from './components/matter-address/matter-address.component';
import {
  MatterTradeMark,
  MatterTradeMarkLabels,
} from 'src/app/pages/matters/enums/matter-trademark';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { matter_statusConfig } from 'src/app/@shared/components/bussiness/shared-matter/matter-status.config';
import { Router, RouterModule } from '@angular/router';
import { MatterDetailsDto } from 'src/app/pages/matters/interfaces/matter-details.interface';
import { PracticeArea } from 'src/app/pages/matters/enums/matter-practicearea';
import { MatterService } from 'src/app/pages/matters/services/matter.service';
import { PermissionService } from 'src/app/@core/services/permission.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-matter-detail-info',
  standalone: true,
  imports: [
    TranslateModule,
    SharedStatusComponent,
    DatePipe,
    ChipModule,
    CommonModule,
    MatterAddressComponent,
    SharedButtonComponent,
    RouterModule,
  ],
  templateUrl: './matter-detail-info.component.html',
  styleUrl: './matter-detail-info.component.scss',
})
export class MatterDetailInfoComponent implements OnInit, OnDestroy {
  _permissionService = inject(PermissionService);
  _unsubscribe = inject(UnsubscribeService);
  _apiService = inject(ApiService);
  _router = inject(Router);
  _matterService = inject(MatterService);
  isAlsuwaidi = environment.brand === 'alsuwaidi';
  isInhouse = environment.brand === 'inhouse';
  data!: MatterDetailsDto;
  practiceArea = PracticeArea;
  statusConfig = matter_statusConfig;
  MatterTradeMarkLabels: any = MatterTradeMarkLabels;
  MatterTradeMark = MatterTradeMark;

  @Input() set id(value: number) {
    this.matterIdentifier = value;
  }
  matterIdentifier: any;
  getMatterData = effect(() => {
    if (this._matterService.getMatterDetails()) {
      this.data = this._matterService.getMatterDetails() as MatterDetailsDto;
    }
  });
  ngOnInit(): void {
  }
  hasPermission(permission: string): boolean {
    return this._permissionService.hasPermission(permission);
  }

  getMatterById() {
    const params = {
      id: this.matterIdentifier,
      LoadFile: false,
    };
    this._apiService
      .get(API_Config.matters.getById, params)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: ApiRes) => {
          if (res && res.isSuccess) this.data = res.result as MatterDetailsDto;
        },
      });
  }
  @Input() requiredPermission?: string;

  get canShow(): boolean {
    if (!this.requiredPermission) return true; 
    return this._permissionService.hasPermission(this.requiredPermission);
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
