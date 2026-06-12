import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import LoadingIcon from '../../../../components/ui/Icons/LoadingIcon'
import type { ReviewUploadPanelProps } from './ReviewUploadPanel.types'

function ReviewUploadPanel({
  canUpload,
  fileError,
  isUploading,
  onFileChange,
  onUpload,
  selectedFileName,
}: ReviewUploadPanelProps) {
  const { t } = useTranslation()
  const fileInputId = useId()

  return (
    <section className="labs-reviewer-panel" aria-labelledby="review-upload-title">
      <div className="labs-reviewer-panel__header">
        <p className="labs-reviewer-panel__eyebrow">
          {t('labsReviewer.upload.eyebrow')}
        </p>
        <h2 id="review-upload-title">{t('labsReviewer.upload.title')}</h2>
        <p>{t('labsReviewer.upload.copy')}</p>
      </div>

      <div className="labs-reviewer-upload">
        <label className="labs-reviewer-upload__label" htmlFor={fileInputId}>
          {t('labsReviewer.upload.fileLabel')}
        </label>
        <input
          accept=".md"
          aria-describedby={
            fileError ? 'review-upload-error' : 'review-upload-help'
          }
          className="labs-reviewer-upload__input"
          disabled={isUploading}
          id={fileInputId}
          onChange={(event) => {
            onFileChange(event.target.files?.[0] ?? null)
            event.target.value = ''
          }}
          type="file"
        />
        <p className="labs-reviewer-upload__help" id="review-upload-help">
          {selectedFileName ?? t('labsReviewer.upload.emptySelection')}
        </p>
        {fileError ? (
          <p className="labs-reviewer-upload__error" id="review-upload-error">
            {fileError}
          </p>
        ) : null}
        <button
          aria-busy={isUploading}
          className="labs-reviewer-button labs-reviewer-button--primary"
          disabled={!canUpload}
          onClick={onUpload}
          type="button"
        >
          {isUploading ? (
            <LoadingIcon className="labs-reviewer-button__icon" />
          ) : null}
          <span>{t('labsReviewer.upload.submit')}</span>
        </button>
      </div>
    </section>
  )
}

export default ReviewUploadPanel
