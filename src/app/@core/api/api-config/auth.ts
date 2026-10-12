export const Auth_API = {
  auth: {
    // ============ OAuth2 + PKCE الجديد ============
    login: 'Auth/login',
    generatePkcePair: 'Auth/generate-pkce-pair',
    verifyOtp: 'Auth/verify-otp',
    token: 'Auth/token',
    refreshToken: 'Auth/refresh-token',

    // ============ Forget Password الجديد ============
    forgotPassword: 'Auth/forgot-password',
    verifyResetOtp: 'Auth/verify-reset-otp',
    resetPassword: 'Auth/reset-password',
    me: 'me',
    // ============ Change Password (لسه محتاج تأكيد من الباك) ============
    changePassword: 'Auth/ChangePassword', // ★ رجّعها مؤقتًا
  },
};