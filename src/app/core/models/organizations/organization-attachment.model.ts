/** OrganizationAttachmentDto as served by Tenancy. */
export type AttachmentType = 'Logo' | 'TaxRegistration' | 'CommercialRegister' | 'Agreement' | 'Other';

export interface OrganizationAttachment {
  id: string;
  organizationId: string;
  attachmentType: AttachmentType;
  /** Enum name, same as attachmentType; kept because the API sends both. */
  attachmentTypeName?: string;
  fileName: string;
  contentType?: string | null;
  sizeBytes: number;
  description?: string | null;
  createdAtUtc: string;
  createdBy?: string | null;
}
