export const ORGANIZATION_ENDPOINTS = {
  getAll: '/Organizations',
  getById: (id: string) => `/Organizations/${id}`,
  getBySubdomain: (sub: string) => `/Organizations/by-subdomain/${sub}`,
  me: '/Organizations/me',
  create: '/Organizations',
  update: (id: string) => `/Organizations/${id}`,
  resetAdminPassword: (id: string) => `/Organizations/${id}/reset-admin-password`,
  uploadLogo: (id: string) => `/Organizations/${id}/logo`,
  updateNotes: (id: string) => `/Organizations/${id}/notes`,
  retryProvisioning: (id: string) => `/Organizations/${id}/retry-provisioning`,
  provisioningStatus: (id: string) => `/Organizations/${id}/provisioning-status`,
  attachments: (id: string) => `/Organizations/${id}/attachments`,
  attachmentById: (orgId: string, attId: string) => `/Organizations/${orgId}/attachments/${attId}`,
  downloadAttachment: (orgId: string, attId: string) =>
    `/Organizations/${orgId}/attachments/${attId}/download`,
} as const;
