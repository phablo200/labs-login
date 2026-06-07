import type {
  AuthUser,
  MessageResponse,
  OAuthAuthorizeResponse,
  OAuthProvidersResponse,
  SignInResponse,
  ValidateTokenResponse,
} from '../../src/features/auth/types'

export const e2eUser: AuthUser = {
  application_id: 'e2e-application',
  email: 'user@example.com',
  id: 'user-e2e',
  name: 'E2E User',
  profile_id: 'profile-e2e',
}

export function authSuccessResponse(
  overrides: Partial<SignInResponse> = {},
): SignInResponse {
  return {
    token: 'e2e-session-token',
    user: e2eUser,
    ...overrides,
  }
}

export function messageResponse(message: string): MessageResponse {
  return { message }
}

export function providerStatusResponse(
  providers: OAuthProvidersResponse['providers'] = [],
): OAuthProvidersResponse {
  return { providers }
}

export function oauthAuthorizeResponse(
  authorizationUrl: string,
): OAuthAuthorizeResponse {
  return {
    authorization_url: authorizationUrl,
    expires_at: '2030-01-01T00:00:00.000Z',
  }
}

export function tokenValidResponse(): ValidateTokenResponse {
  return { valid: true }
}
