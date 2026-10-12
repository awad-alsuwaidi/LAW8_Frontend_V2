export const API_ENDPOINTS = {
  auth: {
    login: '/Auth/login',
    generatePkce: '/Auth/generate-pkce-pair',
    verifyOtp: '/Auth/verify-otp',
    verifyResetOtp: '/Auth/verify-reset-otp',
    token: '/Auth/token',
    changePassword: '/Auth/change-password',
    forgotPassword: '/Auth/forgot-password',
    resendOtp: '/Auth/resend-otp',
    resetPassword: '/Auth/reset-password',
  },

  users: {
    getAll: '/users',
    getById: (id: string) => `/users/${id}`,
    create: '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },

  tenants: {
    getAll: '/tenants',
    getById: (id: string) => `/tenants/${id}`,
  },
} as const;
