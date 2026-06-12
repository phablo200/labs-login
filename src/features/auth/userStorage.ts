import type { AuthenticatedUserResponse } from './types'

const AUTHENTICATED_USER_STORAGE_KEY = 'labs-login.authenticated-user'

export function saveAuthenticatedUser(
  user: AuthenticatedUserResponse,
): void {
  try {
    window.localStorage.setItem(
      AUTHENTICATED_USER_STORAGE_KEY,
      JSON.stringify(user),
    )
  } catch {
    // Local storage can be unavailable in restricted browser contexts.
  }
}

export function getStoredAuthenticatedUser(): AuthenticatedUserResponse | null {
  try {
    const storedUser = window.localStorage.getItem(
      AUTHENTICATED_USER_STORAGE_KEY,
    )

    if (!storedUser) {
      return null
    }

    const parsedUser = JSON.parse(storedUser) as Partial<AuthenticatedUserResponse>

    if (
      typeof parsedUser.id !== 'string' ||
      typeof parsedUser.email !== 'string' ||
      typeof parsedUser.profile_id !== 'string' ||
      typeof parsedUser.application_id !== 'string'
    ) {
      return null
    }

    return {
      application_id: parsedUser.application_id,
      email: parsedUser.email,
      id: parsedUser.id,
      profile_id: parsedUser.profile_id,
    }
  } catch {
    return null
  }
}

export function clearStoredAuthenticatedUser(): void {
  try {
    window.localStorage.removeItem(AUTHENTICATED_USER_STORAGE_KEY)
  } catch {
    // Local storage can be unavailable in restricted browser contexts.
  }
}
