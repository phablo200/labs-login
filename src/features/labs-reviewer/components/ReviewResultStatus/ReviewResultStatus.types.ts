import type {
  AgentProcessStatusDetailResponse,
  AgentProcessStatusSummaryResponse,
  ProcessStatusResponse,
} from '../../types'

export type ReviewResultStatusProps = {
  agentDetail: AgentProcessStatusDetailResponse | null
  agentDetailError: string | null
  editProcessHref: string
  isLoadingAgentDetail: boolean
  isPollingProcess: boolean
  onOpenAgentDetail: (agentProcessId: string) => void
  processStatus: ProcessStatusResponse | null
  processStatusError: string | null
}

export type ReviewResultAgentCardProps = {
  agentProcess: AgentProcessStatusSummaryResponse
  depth: number
  onOpenAgentDetail: (agentProcessId: string) => void
}
