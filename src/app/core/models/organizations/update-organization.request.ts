export interface UpdateOrganizationRequest {
  name?: string;
  subdomain?: string;
  adminNameEn?: string;
  address?: string;
  phoneNumber?: string;
  logoUrl?: string;
  countryId?: number;
  organizationTypeId?: number;
  deploymentType?: 'Cloud' | 'OnPrem';
  currencyId?: number;
}
