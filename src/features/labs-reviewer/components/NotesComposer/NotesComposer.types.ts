export type NotesComposerProps = {
  canCreateNote: boolean
  canSubmitReview: boolean
  composerText: string
  fileError: string | null
  isCreatingNote: boolean
  isSubmittingReview: boolean
  isUploadingFileNote: boolean
  onComposerTextChange: (value: string) => void
  onCreateNote: () => void
  onSubmitReview: () => void
  onUploadFileNote: (file: File | null) => void
}
