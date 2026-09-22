export interface PlatformUser {
  id: string;
  email: string;
  nameEn?: string;
  nameAr?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  active: boolean;
  locked: boolean;
  roles: string[];
  createdAt?: string;
}

export interface CreatePlatformUserDto {
  email: string;
  password?: string;
  nameEn?: string;
  nameAr?: string;
  phoneNumber?: string;
  roles?: string[];
}

export interface UpdatePlatformUserDto {
  email?: string;
  nameEn?: string;
  nameAr?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  active?: boolean;
  locked?: boolean;
}
