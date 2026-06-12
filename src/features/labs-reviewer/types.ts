export type ProcessStatusState = 'FAILED' | 'IN_PROGRESS' | 'SUCCEEDED'

export type ReviewUploadResponse = {
  message: string
  process_id: string
  output_file: string
}

export type AgentProcessStatusSummaryResponse = {
  id: string
  name: string
  status: ProcessStatusState
  loop_from: number | null
  loop_to: number | null
  finished_at: string | null
  children: AgentProcessStatusSummaryResponse[]
}

export type ProcessStatusResponse = {
  id: string
  file: string
  status: ProcessStatusState
  created_at: string
  user_id: string
  data: AgentProcessStatusSummaryResponse[]
}

export type AgentProcessStatusDetailResponse =
  AgentProcessStatusSummaryResponse & {
    result: string | null
  }

export type ReviewOutputItem = {
  filename: string
  path: string
}

export type ReviewOutputsResponse = {
  items: ReviewOutputItem[]
  count: number
}
