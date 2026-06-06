import { requestJson } from '../../lib/api'
import type {
  ForgotPasswordRequest,
  MessageResponse,
  OAuthAuthorizeRequest,
  OAuthAuthorizeResponse,
  OAuthExchangeRequest,
  OAuthProvider,
  OAuthProvidersResponse,
  RefreshTokenResponse,
  RequestOtpLoginRequest,
  ResetPasswordRequest,
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  ValidateTokenResponse,
  VerifyOtpLoginRequest,
} from './types'

export function signIn(request: SignInRequest): Promise<SignInResponse> {
  return requestJson<SignInResponse, SignInRequest>({
    body: request,
    endpoint: '/auth/signin',
    method: 'POST',
  })
}

export function signUp(request: SignUpRequest): Promise<SignInResponse> {
  return requestJson<SignInResponse, SignUpRequest>({
    body: request,
    endpoint: '/auth/signup',
    method: 'POST',
  })
}

export function requestPasswordRecovery(
  request: ForgotPasswordRequest,
): Promise<MessageResponse> {
  return requestJson<MessageResponse, ForgotPasswordRequest>({
    body: request,
    endpoint: '/auth/forgot-password',
    method: 'POST',
  })
}

export function resetPassword(
  request: ResetPasswordRequest,
): Promise<MessageResponse> {
  return requestJson<MessageResponse, ResetPasswordRequest>({
    body: request,
    endpoint: '/auth/reset-password',
    method: 'PATCH',
  })
}

export function requestOtpLogin(
  request: RequestOtpLoginRequest,
): Promise<MessageResponse> {
  return requestJson<MessageResponse, RequestOtpLoginRequest>({
    body: request,
    endpoint: '/auth/request-otp-login',
    method: 'POST',
  })
}

export function verifyOtpLogin(
  request: VerifyOtpLoginRequest,
): Promise<SignInResponse> {
  return requestJson<SignInResponse, VerifyOtpLoginRequest>({
    body: request,
    endpoint: '/auth/verify-otp-login',
    method: 'POST',
  })
}

export function validateToken(token: string): Promise<ValidateTokenResponse> {
  return requestJson<ValidateTokenResponse>({
    bearerToken: token,
    endpoint: '/auth/validate-token',
    method: 'GET',
  })
}

export function refreshToken(token: string): Promise<RefreshTokenResponse> {
  return requestJson<RefreshTokenResponse>({
    bearerToken: token,
    endpoint: '/auth/refresh-token',
    method: 'GET',
  })
}

export function getOAuthProviders(): Promise<OAuthProvidersResponse> {
  return requestJson<OAuthProvidersResponse>({
    endpoint: '/auth/oauth/providers',
    method: 'GET',
  })
}

export function authorizeOAuthProvider(
  provider: OAuthProvider,
  request: OAuthAuthorizeRequest,
): Promise<OAuthAuthorizeResponse> {
  return requestJson<OAuthAuthorizeResponse, OAuthAuthorizeRequest>({
    body: request,
    endpoint: `/auth/oauth/${provider}/authorize`,
    method: 'POST',
  })
}

export function exchangeOAuthCode(
  request: OAuthExchangeRequest,
): Promise<SignInResponse> {
  return requestJson<SignInResponse, OAuthExchangeRequest>({
    body: request,
    endpoint: '/auth/oauth/exchange',
    method: 'POST',
  })
}
