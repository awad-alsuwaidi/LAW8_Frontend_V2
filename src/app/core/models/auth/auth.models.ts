export interface LoginRequest {
  username: string;
  password: string;
}

export interface OtpVerifyRequest {
  username: string;
  otp: string;
  codeChallenge: string;
  redirectUri: string;
}

export interface TokenRequest {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface PkceResponse {
  codeChallenge: string;
  codeVerifier: string;
}
