import type { ProcessStatusResponse } from '../../types'

export type ProcessSidebarProps = {
  isCreatingProcess: boolean
  isLoadingProcesses: boolean
  onCreateProcess: () => void
  onLogout: () => void
  onSelectProcess: (processStatus: ProcessStatusResponse) => void
  processes: ProcessStatusResponse[]
  selectedProcessId: string | null
  signedInEmail: string | null
}
