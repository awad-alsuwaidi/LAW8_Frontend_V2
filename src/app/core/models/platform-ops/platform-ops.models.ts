import { BillingCycle, SubscriptionStatus } from '../subscription/subscription.models';

/* ---------- Plan templates ---------- */

export interface PlanTemplateDto {
  id: number;
  productId: number;
  productCode?: string;
  code: string;
  nameEn: string;
  nameAr?: string | null;
  description?: string | null;
  isTrial: boolean;
  billingCycle: BillingCycle;
  cycleCount?: number | null;
  /** Length in days when billingCycle is None. */
  durationDays?: number | null;
  numberOfUsers: number;
  pricePerAdditionalUser?: number | null;
  totalPrice?: number | null;
  featureIds: number[];
  limits: Record<string, number>;
  sortOrder: number;
  isActive: boolean;
}

export type SavePlanTemplateDto = Omit<PlanTemplateDto, 'id' | 'productCode'>;

/* ---------- Integration catalog ---------- */

export type IntegrationSyncMode = 'Webhook' | 'Scheduled' | 'Both';

export interface IntegrationConfigField {
  key: string;
  label: string;
  required: boolean;
  secret: boolean;
}

export interface IntegrationProviderDto {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  productId: number;
  productCode?: string;
  featureId: number;
  featureCode?: string;
  scopes: string[];
  events: string[];
  syncModes: IntegrationSyncMode;
  defaultSyncIntervalMinutes: number;
  configFields: IntegrationConfigField[];
  isActive: boolean;
}

export type SaveIntegrationProviderDto = Omit<IntegrationProviderDto, 'id' | 'productCode' | 'featureCode'>;

export interface SubscriptionIntegrationDto {
  providerCode: string;
  providerName: string;
  /** The integration's feature is on the subscription. */
  licensed: boolean;
  syncMode: IntegrationSyncMode;
  syncIntervalMinutes: number;
  rateLimitPerMinute: number;
}

/* ---------- Offboarding ---------- */

export interface OffboardingItemDto {
  subscriptionId: string;
  organizationId: string;
  organizationName: string;
  subdomain: string;
  productCode: string;
  status: SubscriptionStatus;
  /** Grace, Archived or PurgeDue. */
  state: string;
  endDate: string;
  cancelledAt?: string | null;
  accessEndsAt?: string | null;
  purgeAt?: string | null;
}

export interface DataDeletionCertificateDto {
  id: string;
  certificateNumber: string;
  organizationId: string;
  organizationName: string;
  subdomain: string;
  products: string[];
  databasesDropped: string[];
  filesDeleted: number;
  bytesDeleted: number;
  organizationFullyPurged: boolean;
  issuedAtUtc: string;
  issuedBy: string;
  fingerprint: string;
}

/* ---------- Storage usage ---------- */

export interface ProductStorageUsageDto {
  product: string;
  fileCount: number;
  totalBytes: number;
  privateBytes: number;
  publicBytes: number;
  totalDisplay: string;
}

export interface OrganizationStorageUsageDto {
  organizationId: string;
  organizationName: string;
  subdomain: string;
  measuredAtUtc?: string | null;
  fileCount: number;
  totalBytes: number;
  totalDisplay: string;
  products: ProductStorageUsageDto[];
}

/* ---------- Exports (exit plan) ---------- */

export interface TenantExportPartDto {
  product: string;
  state: 'Queued' | 'Running' | 'Completed' | 'Failed' | 'Expired' | string;
  files: number;
  bytes: number;
  missingFiles: number;
  error?: string | null;
  downloadUrl?: string | null;
  fileName?: string | null;
}

export interface TenantExportDto {
  id: string;
  organizationId: string;
  state: 'Running' | 'Completed' | 'Failed' | 'Expired' | string;
  includeAllVersions: boolean;
  requestedBy: string;
  requestedAtUtc: string;
  completedAtUtc?: string | null;
  expiresAtUtc?: string | null;
  skippedProducts?: string | null;
  parts: TenantExportPartDto[];
}

/** Human-readable size (B, KB, MB, GB). */
export function formatBytes(bytes: number | null | undefined): string {
  const b = bytes ?? 0;
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = b;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit++; }
  return unit === 0 ? `${b} B` : `${size.toFixed(2)} ${units[unit]}`;
}
