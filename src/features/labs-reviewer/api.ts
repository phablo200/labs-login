import {
  requestLabsReviewerForm,
  requestLabsReviewerJson,
} from '../../lib/api'
import { getLabsReviewerApiConfig } from '../../lib/config'
import type {
  AgentProcessStatusDetailResponse,
  ProcessStatusNoteRequest,
  ProcessStatusNoteResponse,
  ProcessStatusResponse,
  ReviewOutputsResponse,
  ReviewStartResponse,
  WritingProcessStatusResponse,
} from './types'

export function listProcessStatuses(
  token: string,
  term?: string,
): Promise<ProcessStatusResponse[]> {
  const params = new URLSearchParams()

  if (term?.trim()) {
    params.set('term', term.trim())
  }

  const queryString = params.toString()

  return requestLabsReviewerJson<ProcessStatusResponse[]>({
    bearerToken: token,
    endpoint: `/labs/processes/${queryString ? `?${queryString}` : ''}`,
    method: 'GET',
  })
}

export function createWritingProcessStatus(
  token: string,
): Promise<WritingProcessStatusResponse> {
  return requestLabsReviewerJson<WritingProcessStatusResponse>({
    bearerToken: token,
    endpoint: '/labs/processes/create',
    method: 'POST',
  })
}

export function listProcessNotes(
  token: string,
  processStatusId: string,
): Promise<ProcessStatusNoteResponse[]> {
  return requestLabsReviewerJson<ProcessStatusNoteResponse[]>({
    bearerToken: token,
    endpoint: `/labs/processes/notes/${processStatusId}`,
    method: 'GET',
  })
}

export function createProcessNote(
  token: string,
  processStatusId: string,
  note: string,
): Promise<ProcessStatusNoteResponse> {
  const body: ProcessStatusNoteRequest = { note }

  return requestLabsReviewerJson<ProcessStatusNoteResponse>({
    bearerToken: token,
    body,
    endpoint: `/labs/processes/notes/${processStatusId}`,
    method: 'POST',
  })
}

export function updateProcessNote(
  token: string,
  processStatusId: string,
  noteId: string,
  note: string,
): Promise<ProcessStatusNoteResponse> {
  const body: ProcessStatusNoteRequest = { note }

  return requestLabsReviewerJson<ProcessStatusNoteResponse>({
    bearerToken: token,
    body,
    endpoint: `/labs/processes/notes/${processStatusId}?id=${encodeURIComponent(
      noteId,
    )}`,
    method: 'POST',
  })
}

export function uploadProcessNoteFile(
  token: string,
  processStatusId: string,
  file: File,
): Promise<ProcessStatusNoteResponse> {
  const formData = new FormData()
  formData.append('file', file)

  return requestLabsReviewerForm<ProcessStatusNoteResponse>({
    bearerToken: token,
    endpoint: `/labs/processes/files-note/${processStatusId}`,
    formData,
  })
}

export function startProcessReview(
  token: string,
  processStatusId: string,
): Promise<ReviewStartResponse> {
  return requestLabsReviewerJson<ReviewStartResponse>({
    bearerToken: token,
    endpoint: `/labs/review/${processStatusId}`,
    method: 'POST',
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
