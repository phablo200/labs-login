export type AuthUser = {
  id: string
  application_id: string
  name: string
  email: string
  password?: string
  profile_id: string
  created_by?: string
  updated_by?: string
  deleted?: boolean
  created_at?: string
  updated_at?: string
}

export type SignInRequest = {
  email: string
  password: string
}

export type SignInResponse = {
  token: string
  user: AuthUser
}

export type SignUpRequest = {
  name: string
  email: string
  password: string
}

export type SignUpResponse = SignInResponse

export type ForgotPasswordRequest = {
  email: string
}

export type ResetPasswordRequest = {
  token: string
  new_password: string
}

export type RequestOtpLoginRequest = {
  email: string
}

export type VerifyOtpLoginRequest = {
  email: string
  code: string
}

export type MessageResponse = {
  message: string
}

export type AuthErrorResponse = {
  error: string
}

export type ValidateTokenResponse = {
  valid: true
}

export type RefreshTokenResponse = {
  refreshedToken: string
}

export type OAuthProvider = 'github' | 'google'

export type OAuthProviderStatus = {
  provider: string
  enabled: boolean
}

export type OAuthProvidersResponse = {
  providers: OAuthProviderStatus[]
}

export type OAuthAuthorizeRequest = {
  redirect_uri: string
}

export type OAuthAuthorizeResponse = {
  authorization_url: string
  expires_at: string
}

export type OAuthExchangeRequest = {
  code: string
}

export type OAuthCallbackStatus = 'error' | 'success'

export type OAuthCallbackReason =
  | 'oauth_account_conflict'
  | 'oauth_code_exchange_failed'
  | 'oauth_exchange_expired'
  | 'oauth_exchange_invalid'
  | 'oauth_provider_error'
  | 'oauth_state_expired'
  | 'oauth_state_invalid'
  | 'provider_email_unverified'
  | 'provider_not_supported'
