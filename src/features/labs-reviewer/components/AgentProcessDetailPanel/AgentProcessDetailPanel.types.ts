import type { AgentProcessStatusDetailResponse } from '../../types'

export type AgentProcessDetailPanelProps = {
  agentDetail: AgentProcessStatusDetailResponse | null
  agentDetailError: string | null
  isLoading: boolean
  onClose: () => void
}
