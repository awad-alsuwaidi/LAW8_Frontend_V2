export interface LoginRequest {
  username: string;
  password: string;
}

export interface OtpVerifyRequest {
  username: string;
  otp: string;
  codeChallenge: string;
  redirectUri: string;
}

export interface TokenRequest {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface PkceResponse {
  codeChallenge: string;
  codeVerifier: string;
}

export interface User {
  id: string;
  email: string;
  nameEn: string;
  nameAr?: string;
  roles: string[];
  permissions: Permission[];
  active: boolean;
  locked: boolean;
}

export interface Permission {
  routeName: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
  canPrint: boolean;
}

export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  adminEmail: string;
  status: 'Active' | 'Suspended' | 'Cancelled' | 'Pending';
  countryId: number;
  organizationTypeId: number;
}

export interface Subscription {
  id: string;
  organizationId: string;
  productCode: string;
  status: 'Active' | 'Suspended' | 'Cancelled' | 'Pending';
  numberOfUsers: number;
  totalPrice: number;
  taxAmount: number;
  grandTotal: number;
  startDate: string;
  endDate: string;
}

export interface Region {
  id: number;
  code: string;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
}

export interface Country {
  id: number;
  code: string;
  nameEn: string;
  nameAr: string;
  regionId: number;
  taxRate: number;
  isActive: boolean;
}

export interface Product {
  id: number;
  code: string;
  nameEn: string;
  nameAr: string;
  description: string;
  isProvisionable: boolean;
  isActive: boolean;
}

export interface Feature {
  id: number;
  productId: number;
  nameEn: string;
  nameAr: string;
  description: string;
  priceAddOn: number;
  isActive: boolean;
}
