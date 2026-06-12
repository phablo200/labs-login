import type {
  AgentProcessStatusSummaryResponse,
  ProcessStatusResponse,
} from '../../types'

export type ProcessStatusTreeProps = {
  isPolling: boolean
  onOpenAgentDetail: (agentProcessId: string) => void
  processStatus: ProcessStatusResponse | null
  processStatusError: string | null
}

export type AgentProcessStatusRowProps = {
  agentProcess: AgentProcessStatusSummaryResponse
  depth: number
  onOpenAgentDetail: (agentProcessId: string) => void
}
