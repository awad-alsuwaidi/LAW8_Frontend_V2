export const AUTH_ENDPOINTS = {
  login: '/Auth/login',
  generatePkce: '/Auth/generate-pkce-pair',
  verifyOtp: '/Auth/verify-otp',
  verifyResetOtp: '/Auth/verify-reset-otp',
  token: '/Auth/token',
  forgotPassword: '/Auth/forgot-password',
  resendOtp: '/Auth/resend-otp',
  resetPassword: '/Auth/reset-password',
} as const;
