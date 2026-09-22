export type OrganizationStatus = 'Active' | 'Suspended' | 'Cancelled' | 'Pending';

export interface OrganizationSubscriptionSummary {
  id: string;
  productCode: string;
  productName?: string;
  productNameAr?: string | null;
  status: OrganizationStatus;
  numberOfUsers: number;
  startDate: string;
  endDate: string;
  grandTotal: number;
}

/** Raw wire shape returned by Tenancy `GET /Organizations` and `GET /Organizations/{id}`. */
export interface OrganizationApiDto {
  id: string;
  tenantCode: string;
  name: string;
  subdomain: string;
  adminNameEn?: string;
  adminEmail?: string;
  notes?: string;
  createdAtUtc: string;
  address?: string;
  phoneNumber?: string;
  logoUrl?: string;
  countryId?: number;
  countryName?: string;
  countryNameAr?: string | null;
  regionId?: number;
  regionName?: string;
  regionNameAr?: string | null;
  organizationTypeId?: number;
  organizationTypeName?: string;
  organizationTypeNameAr?: string | null;
  deploymentType: 'Cloud' | 'OnPrem';
  identityProvisioned: boolean;
  identityProvisioningError?: string;
  seatsUsed?: number;
  licenseKey?: string;
  currencyId?: number;
  currencyCode?: string;
  currencySymbol?: string;
  currencyDecimals?: number;
  subscriptions: OrganizationSubscriptionSummary[];
  totalActiveTaxAmount: number;
  totalActiveGrandTotal: number;
}

/** UI-facing organization shape. `status` is derived from provisioning + subscriptions. */
export interface Organization {
  id: string;
  tenantCode: string;
  nameEn: string;
  subdomain: string;
  adminEmail: string;
  adminName?: string;
  status: OrganizationStatus;
  countryId?: number;
  countryName?: string;
  countryNameAr?: string | null;
  regionName?: string;
  regionNameAr?: string | null;
  organizationTypeId?: number;
  organizationTypeName?: string;
  organizationTypeNameAr?: string | null;
  deploymentType: 'Cloud' | 'OnPrem';
  logoUrl?: string;
  notes?: string;
  address?: string;
  phoneNumber?: string;
  createdAt: string;
  identityProvisioned: boolean;
  identityProvisioningError?: string;
  seatsUsed?: number;
  licenseKey?: string;
  currencyId?: number;
  currencyCode?: string;
  currencySymbol?: string;
  currencyDecimals?: number;
  subscriptions: OrganizationSubscriptionSummary[];
  totalActiveGrandTotal: number;
}

export function deriveOrganizationStatus(dto: OrganizationApiDto): OrganizationStatus {
  // On-prem tenants are installed on site, so provisioning never gates their status.
  if (!dto.identityProvisioned && dto.deploymentType !== 'OnPrem') return 'Pending';
  const statuses = (dto.subscriptions ?? []).map((s) => s.status);
  if (statuses.includes('Active')) return 'Active';
  if (statuses.includes('Suspended')) return 'Suspended';
  if (statuses.includes('Pending') || statuses.length === 0) return 'Pending';
  return 'Cancelled';
}

export function toOrganization(dto: OrganizationApiDto): Organization {
  return {
    id: dto.id,
    tenantCode: dto.tenantCode,
    nameEn: dto.name,
    subdomain: dto.subdomain,
    adminEmail: dto.adminEmail ?? '',
    adminName: dto.adminNameEn ?? undefined,
    status: deriveOrganizationStatus(dto),
    countryId: dto.countryId ?? undefined,
    countryName: dto.countryName ?? undefined,
    countryNameAr: dto.countryNameAr ?? undefined,
    regionName: dto.regionName ?? undefined,
    regionNameAr: dto.regionNameAr ?? undefined,
    organizationTypeId: dto.organizationTypeId ?? undefined,
    organizationTypeName: dto.organizationTypeName ?? undefined,
    organizationTypeNameAr: dto.organizationTypeNameAr ?? undefined,
    deploymentType: dto.deploymentType,
    logoUrl: dto.logoUrl ?? undefined,
    notes: dto.notes ?? undefined,
    address: dto.address ?? undefined,
    phoneNumber: dto.phoneNumber ?? undefined,
    createdAt: dto.createdAtUtc,
    identityProvisioned: dto.identityProvisioned,
    identityProvisioningError: dto.identityProvisioningError ?? undefined,
    seatsUsed: dto.seatsUsed ?? undefined,
    licenseKey: dto.licenseKey ?? undefined,
    currencyId: dto.currencyId ?? undefined,
    currencyCode: dto.currencyCode ?? undefined,
    currencySymbol: dto.currencySymbol ?? undefined,
    currencyDecimals: dto.currencyDecimals ?? undefined,
    subscriptions: dto.subscriptions ?? [],
    totalActiveGrandTotal: dto.totalActiveGrandTotal ?? 0,
  };
}
