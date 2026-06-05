export type AuthApiConfig = {
  baseUrl: string
  apiKey: string
  applicationId: string
}

export class AuthConfigError extends Error {
  missingKeys: string[]

  constructor(missingKeys: string[]) {
    super(`Missing auth API configuration: ${missingKeys.join(', ')}`)
    this.name = 'AuthConfigError'
    this.missingKeys = missingKeys
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '')
}

export function getAuthApiConfig(): AuthApiConfig {
  const baseUrl = normalizeBaseUrl(
    import.meta.env.VITE_AUTH_API_BASE_URL ?? '',
  )
  const apiKey = (import.meta.env.VITE_AUTH_API_KEY ?? '').trim()
  const applicationId = (
    import.meta.env.VITE_AUTH_APPLICATION_ID ?? ''
  ).trim()
  const missingKeys: string[] = []

  if (!baseUrl) {
    missingKeys.push('VITE_AUTH_API_BASE_URL')
  }

  if (!apiKey) {
    missingKeys.push('VITE_AUTH_API_KEY')
  }

  if (!applicationId) {
    missingKeys.push('VITE_AUTH_APPLICATION_ID')
  }

  if (missingKeys.length > 0) {
    throw new AuthConfigError(missingKeys)
  }

  return {
    applicationId,
    apiKey,
    baseUrl,
  }
}
