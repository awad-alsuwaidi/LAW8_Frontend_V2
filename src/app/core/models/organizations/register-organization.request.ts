export interface SubscriptionRequest {
  productCode: string;
  featureIds?: number[];
  numberOfUsers: number;
  totalPrice?: number;
  discountValue?: number;
  discountType?: 'Percentage' | 'Fixed';
  billingCycle: 'None' | 'Monthly' | 'Quarterly' | 'Yearly';
  cycleCount?: number;
  startDate: string;
  endDate?: string;
}

export interface RegisterOrganizationRequest {
  name: string;
  subdomain: string;
  adminEmail: string;
  adminNameEn?: string;
  countryId?: number;
  organizationTypeId?: number;
  deploymentType?: 'Cloud' | 'OnPrem';
  currencyId?: number;
  subscriptions: SubscriptionRequest[];
}
