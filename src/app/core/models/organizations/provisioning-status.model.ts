export interface ProductProvisioningStatus {
  subscriptionId: string;
  productCode: string;
  databaseProvisioned: boolean;
  provisioningError?: string;
}

export interface ProvisioningStatus {
  organizationId: string;
  subdomain: string;
  identityProvisioned: boolean;
  identityProvisioningError?: string;
  products: ProductProvisioningStatus[];
  allProvisioned: boolean;
}
