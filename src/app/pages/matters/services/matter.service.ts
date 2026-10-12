import { Injectable, signal, WritableSignal } from '@angular/core';
import { MatterCreateDto } from '../interfaces/matter-create.interface';
import { MenuItem } from 'primeng/api';
import { MatterDetailsDto } from '../interfaces/matter-details.interface';

@Injectable({
  providedIn: 'root'
})
export class MatterService {

  private matter: WritableSignal<MatterCreateDto> = signal<MatterCreateDto>({} as MatterCreateDto);
  private matterDetails: WritableSignal<MatterDetailsDto> = signal<MatterDetailsDto>({} as MatterDetailsDto);
  private refreshCurrentTab: WritableSignal<boolean> = signal<boolean>({} as boolean);


  getMatterDetails() {
    return this.matterDetails()
  }

  updateMatterDetails(value: MatterDetailsDto) {
    this.matterDetails.update(() => value);
  }
  getMatter() {
    return this.matter()
  }

  updateMatter(value: MatterCreateDto) {
      console.log('updateMatter', value);

    this.matter.update(() => value);
  }


  getRefreshCurrentTab() {
    return this.refreshCurrentTab()
  }

  updateRefreshCurrentTab(value: boolean=true) {
    this.refreshCurrentTab.update(() => value);
  }
}
