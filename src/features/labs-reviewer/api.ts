import {
  requestLabsReviewerForm,
  requestLabsReviewerJson,
} from '../../lib/api'
import { getLabsReviewerApiConfig } from '../../lib/config'
import type {
  AgentProcessStatusDetailResponse,
  ProcessStatusResponse,
  ReviewOutputsResponse,
  ReviewUploadResponse,
} from './types'

export function uploadReviewMarkdown(
  token: string,
  file: File,
): Promise<ReviewUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return requestLabsReviewerForm<ReviewUploadResponse>({
    bearerToken: token,
    endpoint: '/labs/review',
    formData,
  })
}

export function getProcessStatus(
  token: string,
  processId: string,
): Promise<ProcessStatusResponse> {
  return requestLabsReviewerJson<ProcessStatusResponse>({
    bearerToken: token,
    endpoint: `/labs/processes/${processId}/status`,
    method: 'GET',
  })
}

export function getAgentProcessStatus(
  token: string,
  agentProcessId: string,
): Promise<AgentProcessStatusDetailResponse> {
  return requestLabsReviewerJson<AgentProcessStatusDetailResponse>({
    bearerToken: token,
    endpoint: `/labs/agent-process/${agentProcessId}`,
    method: 'GET',
  })
}

export function listMarkdownOutputs(
  token: string,
): Promise<ReviewOutputsResponse> {
  return requestLabsReviewerJson<ReviewOutputsResponse>({
    bearerToken: token,
    endpoint: '/outputs/makdown',
    method: 'GET',
  })
}

export function listPdfOutputs(token: string): Promise<ReviewOutputsResponse> {
  return requestLabsReviewerJson<ReviewOutputsResponse>({
    bearerToken: token,
    endpoint: '/outputs/pdf',
    method: 'GET',
  })
}

export function buildReviewOutputUrl(path: string): string {
  const { baseUrl } = getLabsReviewerApiConfig()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${baseUrl}${normalizedPath}`
}
