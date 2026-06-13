import type {
  AgentProcessStatusDetailResponse,
  AgentProcessStatusSummaryResponse,
  ProcessStatusResponse,
} from '../../types'

export type ReviewResultStatusProps = {
  agentDetail: AgentProcessStatusDetailResponse | null
  agentDetailError: string | null
  isLoadingAgentDetail: boolean
  isPollingProcess: boolean
  onOpenAgentDetail: (agentProcessId: string) => void
  processId: string
  processStatus: ProcessStatusResponse | null
  processStatusError: string | null
}

export type ReviewResultAgentCardProps = {
  agentProcess: AgentProcessStatusSummaryResponse
  depth: number
  onOpenAgentDetail: (agentProcessId: string) => void
}
