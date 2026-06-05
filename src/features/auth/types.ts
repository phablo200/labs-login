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
