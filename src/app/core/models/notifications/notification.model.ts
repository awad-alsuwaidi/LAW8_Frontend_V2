export type NotificationKind =
  | 'SubscriptionExpiring' | 'SubscriptionExpired'
  | 'ProvisioningFailed' | 'ProvisioningPending' | 'ProvisioningCompleted' | 'LicenseExpiring';

export type NotificationSeverity = 'Info' | 'Warning' | 'Danger';

export interface NotificationDto {
  id: string;
  kind: NotificationKind;
  severity: NotificationSeverity;
  organizationId?: string | null;
  organizationName?: string | null;
  subscriptionId?: string | null;
  productName?: string | null;
  productNameAr?: string | null;
  daysLeft?: number | null;
  detail?: string | null;
  route: string;
  occurredAtUtc: string;
}
