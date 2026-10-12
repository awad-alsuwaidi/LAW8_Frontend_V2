import { Injectable, signal, WritableSignal } from '@angular/core';
import { UserProfileDto } from '../interface/user-profile.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private profileData: WritableSignal<UserProfileDto> = signal<UserProfileDto>({} as UserProfileDto);
  getProfileData() {
    return this.profileData()
  }

  updateProfileData(value: UserProfileDto) {
    this.profileData.update(() => value);
  }
}
