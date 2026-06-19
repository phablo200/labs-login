import { useTranslation } from 'react-i18next'
import LoadingIcon from '../../../../components/ui/Icons/LoadingIcon'
import type { ProcessStatusNoteResponse } from '../../types'
import NotesComposer from '../NotesComposer/NotesComposer'
import type { ProcessWorkspaceProps } from './ProcessWorkspace.types'
import './ProcessWorkspace.css'

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function NoteItem({
  activeEditNoteId,
  canSaveNoteEdit,
  editText,
  isEditingNote,
  note,
  onCancelNoteEdit,
  onEditTextChange,
  onSaveNoteEdit,
  onStartNoteEdit,
}: {
  activeEditNoteId: string | null
  canSaveNoteEdit: boolean
  editText: string
  isEditingNote: boolean
  note: ProcessStatusNoteResponse
  onCancelNoteEdit: () => void
  onEditTextChange: (value: string) => void
  onSaveNoteEdit: () => void
  onStartNoteEdit: (note: ProcessStatusNoteResponse) => void
}) {
  const { t } = useTranslation()
  const isEditing = activeEditNoteId === note.id

  return (
    <article className="process-workspace-note">
      <div className="process-workspace-note__meta">
        <span>{formatDateTime(note.created_at)}</span>
        {note.updated_at !== note.created_at ? (
          <span>{t('labsReviewer.notes.edited')}</span>
        ) : null}
      </div>

      {isEditing ? (
        <div className="process-workspace-note__edit">
          <textarea
            aria-label={t('labsReviewer.notes.editNote')}
            className="process-workspace-note__edit-input"
            disabled={isEditingNote}
            onChange={(event) => onEditTextChange(event.target.value)}
            rows={4}
            value={editText}
          />
          <div className="process-workspace-note__actions">
            <button
              className="process-workspace-note__button"
              disabled={isEditingNote}
              onClick={onCancelNoteEdit}
              type="button"
            >
              {t('labsReviewer.notes.cancelEdit')}
            </button>
            <button
              aria-busy={isEditingNote}
              className="process-workspace-note__button process-workspace-note__button--primary"
              disabled={!canSaveNoteEdit}
              onClick={onSaveNoteEdit}
              type="button"
            >
              {isEditingNote ? (
                <LoadingIcon className="process-workspace-note__button-icon" />
              ) : null}
              <span>{t('labsReviewer.notes.saveEdit')}</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="process-workspace-note__description">
            {note.description}
          </p>
          <button
            className="process-workspace-note__edit-button"
            onClick={() => onStartNoteEdit(note)}
            type="button"
          >
            {t('labsReviewer.notes.editNote')}
          </button>
        </>
      )}
    </article>
  )
}

function ProcessWorkspace({
  activeEditNoteId,
  canCreateNote,
  canSaveNoteEdit,
  canSubmitReview,
  composerText,
  editText,
  fileError,
  isCreatingNote,
  isCreatingProcess,
  isEditingNote,
  isLoadingNotes,
  isSubmittingReview,
  isUploadingFileNote,
  notes,
  onCancelNoteEdit,
  onComposerTextChange,
  onCreateNote,
  onCreateProcess,
  onEditTextChange,
  onSaveNoteEdit,
  onStartNoteEdit,
  onSubmitReview,
  onUploadFileNote,
  selectedProcess,
  selectedProcessMissing,
}: ProcessWorkspaceProps) {
  const { t } = useTranslation()

  if (selectedProcessMissing) {
    return (
      <section className="process-workspace process-workspace--centered">
        <div className="process-workspace__empty-state">
          <p className="process-workspace__eyebrow">
            {t('labsReviewer.workspace.notFoundEyebrow')}
          </p>
          <h1>{t('labsReviewer.workspace.notFoundTitle')}</h1>
          <p>{t('labsReviewer.workspace.notFoundCopy')}</p>
        </div>
      </section>
    )
  }

  if (!selectedProcess) {
    return (
      <section className="process-workspace process-workspace--centered">
        <div className="process-workspace__empty-state">
          <p className="process-workspace__eyebrow">
            {t('labsReviewer.dashboard.eyebrow')}
          </p>
          <h1>{t('labsReviewer.workspace.emptyTitle')}</h1>
          <p>{t('labsReviewer.workspace.emptyCopy')}</p>
          <button
            aria-busy={isCreatingProcess}
            className="process-workspace__primary-action"
            disabled={isCreatingProcess}
            onClick={onCreateProcess}
            type="button"
          >
            {isCreatingProcess ? (
              <LoadingIcon className="process-workspace__button-icon" />
            ) : null}
            <span>{t('labsReviewer.sidebar.newProcess')}</span>
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="process-workspace" aria-labelledby="process-workspace-title">
      <header className="process-workspace__header">
        <div>
          <p className="process-workspace__eyebrow">
            {t('labsReviewer.dashboard.eyebrow')}
          </p>
          <h1 id="process-workspace-title">
            {selectedProcess.file?.trim() || t('labsReviewer.process.untitled')}
          </h1>
          <p className="process-workspace__copy">
            {t('labsReviewer.workspace.copy')}
          </p>
        </div>
        <span
          className={`process-workspace__status process-workspace__status--${selectedProcess.status.toLowerCase()}`}
        >
          {t(`labsReviewer.status.${selectedProcess.status}`)}
        </span>
      </header>

      <div className="process-workspace__notes" aria-live="polite">
        {isLoadingNotes ? (
          <p className="process-workspace__loading">
            <LoadingIcon className="process-workspace__button-icon" />
            {t('labsReviewer.notes.loading')}
          </p>
        ) : notes.length > 0 ? (
          notes.map((note) => (
            <NoteItem
              activeEditNoteId={activeEditNoteId}
              canSaveNoteEdit={canSaveNoteEdit}
              editText={editText}
              isEditingNote={isEditingNote}
              key={note.id}
              note={note}
              onCancelNoteEdit={onCancelNoteEdit}
              onEditTextChange={onEditTextChange}
              onSaveNoteEdit={onSaveNoteEdit}
              onStartNoteEdit={onStartNoteEdit}
            />
          ))
        ) : (
          <p className="process-workspace__empty-notes">
            {t('labsReviewer.notes.empty')}
          </p>
        )}
      </div>

      <NotesComposer
        canCreateNote={canCreateNote}
        canSubmitReview={canSubmitReview}
        composerText={composerText}
        fileError={fileError}
        isCreatingNote={isCreatingNote}
        isSubmittingReview={isSubmittingReview}
        isUploadingFileNote={isUploadingFileNote}
        onComposerTextChange={onComposerTextChange}
        onCreateNote={onCreateNote}
        onSubmitReview={onSubmitReview}
        onUploadFileNote={onUploadFileNote}
      />
    </section>
  )
}

export default ProcessWorkspace
