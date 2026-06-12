import type { ReviewOutputsResponse } from '../../types'

export type ReviewOutputsPanelProps = {
  isRefreshing: boolean
  markdownOutputs: ReviewOutputsResponse
  onRefresh: () => void
  pdfOutputs: ReviewOutputsResponse
}
