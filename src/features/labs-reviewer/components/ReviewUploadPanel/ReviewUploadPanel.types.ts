export type ReviewUploadPanelProps = {
  canUpload: boolean
  fileError: string | null
  isUploading: boolean
  onFileChange: (file: File | null) => void
  onUpload: () => void
  selectedFileName: string | null
}
