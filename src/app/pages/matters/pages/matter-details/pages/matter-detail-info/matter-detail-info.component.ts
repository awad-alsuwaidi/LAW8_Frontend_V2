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
  matterIdentifier: any;

  @Input() requiredPermission?: string;

  hasPermission(permission: string): boolean {
    return this._permissionService.hasPermission(permission);
  }

getMatterData = effect(() => {
  const matterData = this._matterService.getMatterDetails();
  if (matterData) {
    this.data = matterData as any;
    this.matterIdentifier = this.data?.id ?? null;   
  }
});

  get canShow(): boolean {
    if (!this.requiredPermission) return true;
    return this._permissionService.hasPermission(this.requiredPermission);
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
