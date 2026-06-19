import type {
  ProcessStatusNoteResponse,
  ProcessStatusResponse,
} from '../../types'

export type ProcessWorkspaceProps = {
  activeEditNoteId: string | null
  canCreateNote: boolean
  canSaveNoteEdit: boolean
  canSubmitReview: boolean
  composerText: string
  editText: string
  fileError: string | null
  isCreatingNote: boolean
  isCreatingProcess: boolean
  isEditingNote: boolean
  isLoadingNotes: boolean
  isSubmittingReview: boolean
  isUploadingFileNote: boolean
  notes: ProcessStatusNoteResponse[]
  onCancelNoteEdit: () => void
  onComposerTextChange: (value: string) => void
  onCreateNote: () => void
  onCreateProcess: () => void
  onEditTextChange: (value: string) => void
  onSaveNoteEdit: () => void
  onStartNoteEdit: (note: ProcessStatusNoteResponse) => void
  onSubmitReview: () => void
  onUploadFileNote: (file: File | null) => void
  selectedProcess: ProcessStatusResponse | null
  selectedProcessMissing: boolean
}
