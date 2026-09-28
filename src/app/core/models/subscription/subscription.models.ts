import { PaginatedResult } from '../setup/setup.models';

export type { PaginatedResult };

export type BillingCycle = 'None' | 'Monthly' | 'Quarterly' | 'Yearly';
export type SubscriptionStatus = 'Pending' | 'Active' | 'Suspended' | 'Cancelled' | 'Expired';
export type DiscountType = 'None' | 'FixedAmount' | 'Percentage';
export type SubscriptionAction =
  | 'Created' | 'Suspended' | 'Reactivated' | 'Cancelled' | 'Renewed' | 'UsersAdded' | 'UsersRemoved'
  | 'FeaturesChanged' | 'Expired' | 'Archived' | 'Purged' | 'LimitsChanged' | 'StorageAdded';

export interface SubscriptionDetailDto {
  id: string;
  organizationId: string;
  organizationName: string;
  subdomain: string;
  billingCycle: BillingCycle;
  cycleCount?: number;
  pricePerAdditionalUser?: number;
  numberOfUsers: number;
  discountValue?: number;
  discountType?: DiscountType;
  totalPrice: number;
  taxRateApplied?: number;
  taxAmount: number;
  grandTotal: number;
  lastProratedAdjustment?: number;
  currencyCode?: string;
  currencySymbol?: string;
  currencyDecimals?: number;
  productCode: string;
  productName?: string;
  productNameAr?: string | null;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  remainingDays: number;
  isExpired: boolean;
  suspendedAt?: string;
  suspensionReason?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAtUtc: string;
  /** What the organization can do now. */
  access?: 'Full' | 'ReadOnly' | 'Locked' | 'None';
  /** Active, Pending, Suspended, Grace (read-only), Archived, PurgeDue or Purged. */
  accessState?: string;
  accessEndsAt?: string | null;
  purgeAt?: string | null;
  expiredAt?: string | null;
  purgedAt?: string | null;
  features?: { featureId: number; code: string; nameEn: string; nameAr?: string | null; priceAddOnAtSelection: number }[];
  /** Trial subscription (usually free and short). */
  isTrial?: boolean;
  /** Quotas of a limited ("Lite") subscription, keyed by limit key; missing = unlimited. */
  limits?: Record<string, number>;
  /** Storage bought on top of the plan's storage limit (GB). */
  extraStorageGb?: number;
  /** The product's default price per extra GB (null = not sold). */
  pricePerExtraGb?: number | null;
}

export interface SubscriptionHistoryDto {
  id: string;
  subscriptionId: string;
  action: SubscriptionAction;
  startDate: string;
  endDate: string;
  remainingDaysAtAction: number;
  priceAtAction: number;
  numberOfUsersAtAction: number;
  reason?: string;
  changedAt: string;
  changedBy?: string;
}

export interface SuspendSubscriptionDto { reason?: string; }
export interface CancelSubscriptionDto { reason?: string; }
export interface AddUsersDto { count: number; }
/** Extra storage for the rest of the period; pricePerGb defaults to the product's price. */
export interface AddStorageDto { gb: number; pricePerGb?: number; }

/** A quota a product understands (GET /subscriptions/limit-definitions, grouped by product code). */
export interface LimitDefinition {
  key: string;
  nameEn: string;
  nameAr: string;
  unit: 'count' | 'MB' | string;
}

export interface UpdateSubscriptionLimitsDto {
  /** Empty object = unlimited. */
  limits: Record<string, number>;
  isTrial?: boolean;
}

export interface RenewSubscriptionDto {
  billingCycle: BillingCycle;
  cycleCount?: number;
  /** Required when billingCycle is None. */
  endDate?: string;
  /** Price of the new period (pre-tax, after discount); omitted keeps the current price. */
  totalPrice?: number;
  reason?: string;
}
