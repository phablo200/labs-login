import { useNavigate } from 'react-router-dom'
import ProcessSidebar from '../../features/labs-reviewer/components/ProcessSidebar/ProcessSidebar'
import ProcessWorkspace from '../../features/labs-reviewer/components/ProcessWorkspace/ProcessWorkspace'
import { useLabsReviewerDashboard } from '../../features/labs-reviewer/hooks/useLabsReviewerDashboard'
import {
  clearStoredAuthenticatedUser,
  getStoredAuthenticatedUser,
} from '../../features/auth/userStorage'
import { clearSessionToken } from '../../lib/session'
import { AppRoute } from '../../routes/routes.enum'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()
  const storedUser = getStoredAuthenticatedUser()
  const dashboard = useLabsReviewerDashboard()

  function handleLogout() {
    clearSessionToken()
    clearStoredAuthenticatedUser()
    navigate(AppRoute.SignIn, { replace: true })
  }

  return (
    <main className="home-page" aria-label="Labs Reviewer workspace">
      <ProcessSidebar
        isCreatingProcess={dashboard.isCreatingProcess}
        isLoadingProcesses={dashboard.isLoadingProcesses}
        onCreateProcess={dashboard.createProcess}
        onLogout={handleLogout}
        onSelectProcess={dashboard.selectProcess}
        processes={dashboard.state.processes}
        selectedProcessId={dashboard.state.selectedProcessId}
        signedInEmail={storedUser?.email ?? null}
      />
      <ProcessWorkspace
        activeEditNoteId={dashboard.state.activeEditNoteId}
        canCreateNote={dashboard.canCreateNote}
        canSaveNoteEdit={dashboard.canSaveNoteEdit}
        canSubmitReview={dashboard.canSubmitReview}
        composerText={dashboard.state.composerText}
        editText={dashboard.state.editText}
        fileError={dashboard.state.fileError}
        isCreatingNote={dashboard.isCreatingNote}
        isCreatingProcess={dashboard.isCreatingProcess}
        isEditingNote={dashboard.isEditingNote}
        isLoadingNotes={dashboard.isLoadingNotes}
        isSubmittingReview={dashboard.isSubmittingReview}
        isUploadingFileNote={dashboard.isUploadingFileNote}
        notes={dashboard.state.notes}
        onCancelNoteEdit={dashboard.cancelNoteEdit}
        onComposerTextChange={dashboard.updateComposerText}
        onCreateNote={dashboard.createNote}
        onCreateProcess={dashboard.createProcess}
        onEditTextChange={dashboard.updateEditText}
        onSaveNoteEdit={dashboard.saveNoteEdit}
        onStartNoteEdit={dashboard.startNoteEdit}
        onSubmitReview={dashboard.submitReview}
        onUploadFileNote={dashboard.uploadFileNote}
        selectedProcess={dashboard.selectedProcess}
        selectedProcessMissing={dashboard.state.selectedProcessMissing}
      />
    </main>
  )
}

export default HomePage
