import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import SignOut from '../../components/ui/Icons/SignOut'
import ReviewUploadPanel from '../../features/labs-reviewer/components/ReviewUploadPanel/ReviewUploadPanel'
import { useLabsReviewerDashboard } from '../../features/labs-reviewer/hooks/useLabsReviewerDashboard'
import {
  clearStoredAuthenticatedUser,
  getStoredAuthenticatedUser,
} from '../../features/auth/userStorage'
import { clearSessionToken } from '../../lib/session'
import { AppRoute } from '../../routes/routes.enum'

function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const storedUser = getStoredAuthenticatedUser()
  const dashboard = useLabsReviewerDashboard()

  function handleLogout() {
    clearSessionToken()
    clearStoredAuthenticatedUser()
    navigate(AppRoute.SignIn, { replace: true })
  }

  return (
    <main className="labs-reviewer-page" aria-labelledby="home-title">
      <div className="labs-reviewer-page__header">
        <div>
          <h1 id="home-title">{t('labsReviewer.dashboard.title')}</h1>
          <p className="route-copy">{t('labsReviewer.dashboard.copy')}</p>
          {storedUser ? (
            <p className="labs-reviewer-page__user">
              {t('labsReviewer.dashboard.signedInAs', {
                email: storedUser.email,
              })}
            </p>
          ) : null}
        </div>
        <div className="labs-reviewer-page__actions">
          <button
            className="route-logout-button"
            onClick={handleLogout}
            type="button"
          >
            <SignOut className="route-logout-button__icon" />
            {t('actions.logout')}
          </button>
        </div>
      </div>

      <div className="labs-reviewer-page__grid">
        <div className="labs-reviewer-page__main">
          <ReviewUploadPanel
            canUpload={dashboard.canUpload}
            fileError={dashboard.state.fileError}
            isUploading={dashboard.isUploading}
            onFileChange={dashboard.handleFileChange}
            onUpload={dashboard.uploadSelectedFile}
            selectedFileName={dashboard.state.selectedFileName}
          />
        </div>
      </div>
    </main>
  )
}

export default HomePage
