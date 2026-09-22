export type LicenseKeyType = 'Production' | 'Trial' | 'Development';
export type LicenseKeyStatus = 'Available' | 'Activated' | 'Expired' | 'Cancelled';
export type ActivationStatus = 'Active' | 'Released' | 'Expired';

export interface LicenseKeySummaryDto {
  id: string;
  key: string;
  tenantId: string;
  tenantName?: string;
  type: LicenseKeyType;
  status: LicenseKeyStatus;
  createdAtUtc: string;
  currentExpiresAtUtc?: string;
  currentMachineHostname?: string;
}

export interface ActivationSummaryDto {
  id: string;
  hostname: string;
  machineFingerprintPrefix?: string;
  activatedAtUtc: string;
  expiresAtUtc?: string;
  status: ActivationStatus;
  releasedAtUtc?: string;
  softwareVersion?: string;
}

export interface RenewalSummaryDto {
  renewedAtUtc: string;
  previousExpiresAtUtc?: string;
  newExpiresAtUtc?: string;
}

export interface LicenseKeyDetailsDto extends LicenseKeySummaryDto {
  notes?: string;
  activations: ActivationSummaryDto[];
  renewals: RenewalSummaryDto[];
}

export interface CreateLicenseKeyDto {
  tenantId: string;
  type?: LicenseKeyType;
  notes?: string;
}

export interface ReleaseActivationDto {
  reason: string;
}
