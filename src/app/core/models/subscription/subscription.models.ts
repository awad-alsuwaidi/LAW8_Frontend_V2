import { PaginatedResult } from '../setup/setup.models';

export type { PaginatedResult };

export type BillingCycle = 'None' | 'Monthly' | 'Quarterly' | 'Yearly';
export type SubscriptionStatus = 'Pending' | 'Active' | 'Suspended' | 'Cancelled';
export type DiscountType = 'None' | 'FixedAmount' | 'Percentage';
export type SubscriptionAction = 'Created' | 'Suspended' | 'Reactivated' | 'Cancelled' | 'Renewed' | 'UsersAdded' | 'UsersRemoved';

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
