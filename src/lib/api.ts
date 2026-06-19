import {
  getAuthApiConfig,
  getLabsReviewerApiConfig,
  RuntimeConfigError,
} from './config'
import { getBackendLanguage } from './language'

export type HttpMethod = 'GET' | 'PATCH' | 'POST'

export type ApiErrorKind =
  | 'auth'
  | 'backend'
  | 'configuration'
  | 'network'
  | 'service'
  | 'unexpected'

export type RequestJsonOptions<TBody> = {
  endpoint: string
  method: HttpMethod
  body?: TBody
  bearerToken?: string
}

export type RequestLabsReviewerFormOptions = {
  endpoint: string
  formData: FormData
  bearerToken: string
}

export type RequestLabsReviewerJsonOptions = {
  endpoint: string
  method: Extract<HttpMethod, 'GET' | 'POST'>
  body?: unknown
  bearerToken: string
}

type BackendErrorResponse = {
  error?: unknown
  detail?: unknown
}

export class ApiRequestError extends Error {
  kind: ApiErrorKind
  status?: number

  constructor(
    kind: ApiErrorKind,
    message: string,
    options?: { status?: number; cause?: unknown },
  ) {
    super(message)
    this.name = 'ApiRequestError'
    this.kind = kind
    this.status = options?.status
    this.cause = options?.cause
  }
}

function buildUrl(baseUrl: string, endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  return `${baseUrl}${normalizedEndpoint}`
}

function getBackendErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const error = (data as BackendErrorResponse).error
  const detail = (data as BackendErrorResponse).detail

  if (typeof error === 'string' && error.trim()) {
    return error
  }

  return typeof detail === 'string' && detail.trim() ? detail : null
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined
  }

  const text = await response.text()

  if (!text.trim()) {
    return undefined
  }

  try {
    return JSON.parse(text) as unknown
  } catch (error) {
    throw new ApiRequestError(
      response.ok ? 'unexpected' : response.status >= 500 ? 'service' : 'auth',
      'Malformed JSON response from auth service',
      { cause: error, status: response.status },
    )
  }
}

export async function requestJson<TResponse, TBody = unknown>({
  bearerToken,
  body,
  endpoint,
  method,
}: RequestJsonOptions<TBody>): Promise<TResponse> {
  let config

  try {
    config = getAuthApiConfig()
  } catch (error) {
    if (error instanceof RuntimeConfigError) {
      if (import.meta.env.DEV) {
        console.error(error.message)
      }

      throw new ApiRequestError('configuration', error.message, {
        cause: error,
      })
    }

    throw error
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'accept-language': getBackendLanguage(),
    'x-api-key': config.apiKey,
    'x-application-id': config.applicationId,
  }

  if (bearerToken) {
    headers.Authorization = `Bearer ${bearerToken}`
  }

  let response: Response

  try {
    response = await fetch(buildUrl(config.baseUrl, endpoint), {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers,
      method,
    })
  } catch (error) {
    throw new ApiRequestError(
      'network',
      'Network failure while contacting auth service',
      { cause: error },
    )
  }

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    if (response.status >= 400 && response.status < 500) {
      const message = getBackendErrorMessage(data)

      if (message) {
        throw new ApiRequestError('backend', message, {
          status: response.status,
        })
      }

      throw new ApiRequestError(
        'auth',
        'Auth service rejected the request',
        { status: response.status },
      )
    }

    throw new ApiRequestError('service', 'Auth service unavailable', {
      status: response.status,
    })
  }

  return data as TResponse
}

function getLabsReviewerConfigOrThrow() {
  try {
    return getLabsReviewerApiConfig()
  } catch (error) {
    if (error instanceof RuntimeConfigError) {
      if (import.meta.env.DEV) {
        console.error(error.message)
      }

      throw new ApiRequestError('configuration', error.message, {
        cause: error,
      })
    }

    throw error
  }
}

async function handleLabsReviewerResponse<TResponse>(
  response: Response,
): Promise<TResponse> {
  const data = await parseJsonResponse(response)

  if (!response.ok) {
    if (response.status >= 400 && response.status < 500) {
      const message = getBackendErrorMessage(data)

      if (message) {
        throw new ApiRequestError('backend', message, {
          status: response.status,
        })
      }

      throw new ApiRequestError('auth', 'Labs reviewer rejected the request', {
        status: response.status,
      })
    }

    throw new ApiRequestError('service', 'Labs reviewer service unavailable', {
      status: response.status,
    })
  }

  return data as TResponse
}

export async function requestLabsReviewerJson<TResponse>({
  bearerToken,
  body,
  endpoint,
  method,
}: RequestLabsReviewerJsonOptions): Promise<TResponse> {
  const config = getLabsReviewerConfigOrThrow()
  const headers: HeadersInit = {
    'accept-language': getBackendLanguage(),
    Authorization: `Bearer ${bearerToken}`,
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  let response: Response

  try {
    response = await fetch(buildUrl(config.baseUrl, endpoint), {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers,
      method,
    })
  } catch (error) {
    throw new ApiRequestError(
      'network',
      'Network failure while contacting labs reviewer',
      { cause: error },
    )
  }

  return handleLabsReviewerResponse<TResponse>(response)
}

export async function requestLabsReviewerForm<TResponse>({
  bearerToken,
  endpoint,
  formData,
}: RequestLabsReviewerFormOptions): Promise<TResponse> {
  const config = getLabsReviewerConfigOrThrow()
  const headers: HeadersInit = {
    'accept-language': getBackendLanguage(),
    Authorization: `Bearer ${bearerToken}`,
  }

  let response: Response

  try {
    response = await fetch(buildUrl(config.baseUrl, endpoint), {
      body: formData,
      headers,
      method: 'POST',
    })
  } catch (error) {
    throw new ApiRequestError(
      'network',
      'Network failure while contacting labs reviewer',
      { cause: error },
    )
  }

  return handleLabsReviewerResponse<TResponse>(response)
}
