export interface DashboardSummary {
  totalOrganizations: number;
  newOrganizationsLast30Days: number;
  totalActiveSubscriptions: number;
  /** Cross-currency sum - never display as a single money figure. */
  totalActiveRevenue: number;
  revenueByCurrency: RevenueByCurrency[];
  organizationsByDeploymentType: CountByLabel[];
  organizationsByType: CountByLabel[];
  subscriptionsByStatus: CountByLabel[];
  subscriptionsByProduct: CountByLabel[];
  recentActivity: AuditLogDto[];
  atRiskSubscriptionsCount: number;
  atRiskSubscriptions: AtRiskSubscriptionDto[];
}

export interface RevenueByCurrency {
  currencyCode: string;
  currencySymbol: string;
  amount: number;
}

export interface CountByLabel {
  label: string;
  /** Arabic label for lookup-keyed groups (org type, product); null for enum-keyed ones. */
  labelAr?: string | null;
  count: number;
}

export interface AtRiskSubscriptionDto {
  subscriptionId: string;
  organizationId: string;
  organizationName: string;
  productCode: string;
  productName: string | null;
  endDate: string;
  daysLeft: number;
  currencyCode?: string;
  currencySymbol?: string;
}

export interface AuditLogDto {
  id: string;
  entityName: string;
  entityId: string;
  action: string;
  changes: string | null;
  changedBy: string | null;
  changedAtUtc: string;
}
