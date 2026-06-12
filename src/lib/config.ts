export type AuthApiConfig = {
  baseUrl: string
  apiKey: string
  applicationId: string
}

export type LabsReviewerApiConfig = {
  baseUrl: string
}

export class RuntimeConfigError extends Error {
  missingKeys: string[]

  constructor(serviceName: string, missingKeys: string[]) {
    super(`Missing ${serviceName} configuration: ${missingKeys.join(', ')}`)
    this.name = 'RuntimeConfigError'
    this.missingKeys = missingKeys
  }
}

export class AuthConfigError extends RuntimeConfigError {
  constructor(missingKeys: string[]) {
    super('auth API', missingKeys)
    this.name = 'AuthConfigError'
  }
}

export class LabsReviewerConfigError extends RuntimeConfigError {
  constructor(missingKeys: string[]) {
    super('labs reviewer API', missingKeys)
    this.name = 'LabsReviewerConfigError'
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

export function getLabsReviewerApiConfig(): LabsReviewerApiConfig {
  const baseUrl = normalizeBaseUrl(
    import.meta.env.VITE_LABS_REVIEWER_API_BASE_URL ?? '',
  )
  const missingKeys: string[] = []

  if (!baseUrl) {
    missingKeys.push('VITE_LABS_REVIEWER_API_BASE_URL')
  }

  if (missingKeys.length > 0) {
    throw new LabsReviewerConfigError(missingKeys)
  }

  return {
    baseUrl,
  }
}
