import { useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import AddIcon from '../../../../components/ui/Icons/AddIcon'
import LoadingIcon from '../../../../components/ui/Icons/LoadingIcon'
import type { NotesComposerProps } from './NotesComposer.types'
import './NotesComposer.css'

function NotesComposer({
  canCreateNote,
  canSubmitReview,
  composerText,
  fileError,
  isCreatingNote,
  isSubmittingReview,
  isUploadingFileNote,
  onComposerTextChange,
  onCreateNote,
  onSubmitReview,
  onUploadFileNote,
}: NotesComposerProps) {
  const { t } = useTranslation()
  const fileInputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isBusy = isCreatingNote || isUploadingFileNote || isSubmittingReview

  return (
    <div className="notes-composer" aria-label={t('labsReviewer.notes.label')}>
      <div className="notes-composer__input-shell">
        <button
          aria-label={t('labsReviewer.notes.attachFile')}
          className="notes-composer__icon-button"
          disabled={isBusy}
          onClick={() => fileInputRef.current?.click()}
          title={t('labsReviewer.notes.attachFile')}
          type="button"
        >
          {isUploadingFileNote ? (
            <LoadingIcon className="notes-composer__icon" />
          ) : (
            <AddIcon className="notes-composer__icon" />
          )}
        </button>
        <input
          accept=".md,.txt"
          className="notes-composer__file-input"
          disabled={isBusy}
          id={fileInputId}
          onChange={(event) => {
            onUploadFileNote(event.target.files?.[0] ?? null)
            event.target.value = ''
          }}
          ref={fileInputRef}
          type="file"
        />
        <textarea
          aria-label={t('labsReviewer.notes.placeholder')}
          className="notes-composer__textarea"
          disabled={isBusy}
          onChange={(event) => onComposerTextChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && canCreateNote) {
              event.preventDefault()
              onCreateNote()
            }
          }}
          placeholder={t('labsReviewer.notes.placeholder')}
          rows={2}
          value={composerText}
        />
        <button
          aria-busy={isCreatingNote}
          aria-label={t('labsReviewer.notes.send')}
          className="notes-composer__icon-button notes-composer__icon-button--send"
          disabled={!canCreateNote}
          onClick={onCreateNote}
          title={t('labsReviewer.notes.send')}
          type="button"
        >
          {isCreatingNote ? (
            <LoadingIcon className="notes-composer__icon" />
          ) : (
            <span aria-hidden="true" className="notes-composer__send-arrow">
              ^
            </span>
          )}
        </button>
      </div>

      {fileError ? (
        <p className="notes-composer__error">{fileError}</p>
      ) : (
        <p className="notes-composer__help">
          {t('labsReviewer.notes.fileHelp')}
        </p>
      )}

      <button
        aria-busy={isSubmittingReview}
        className="notes-composer__submit"
        disabled={!canSubmitReview}
        onClick={onSubmitReview}
        type="button"
      >
        {isSubmittingReview ? (
          <LoadingIcon className="notes-composer__submit-icon" />
        ) : null}
        <span>{t('labsReviewer.notes.submitReview')}</span>
      </button>
    </div>
  )
}

export default NotesComposer
