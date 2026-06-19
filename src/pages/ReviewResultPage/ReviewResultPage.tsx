import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ProcessSidebar from '../../features/labs-reviewer/components/ProcessSidebar/ProcessSidebar'
import ReviewResultStatus from '../../features/labs-reviewer/components/ReviewResultStatus/ReviewResultStatus'
import { useLabsReviewerDashboard } from '../../features/labs-reviewer/hooks/useLabsReviewerDashboard'
import {
  clearStoredAuthenticatedUser,
  getStoredAuthenticatedUser,
} from '../../features/auth/userStorage'
import { clearSessionToken } from '../../lib/session'
import { AppRoute } from '../../routes/routes.enum'
import './ReviewResultPage.css'

function ReviewResultPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const storedUser = getStoredAuthenticatedUser()
  const processId = searchParams.get('process_id')
  const dashboard = useLabsReviewerDashboard(processId)

  function handleLogout() {
    clearSessionToken()
    clearStoredAuthenticatedUser()
    navigate(AppRoute.SignIn, { replace: true })
  }

  useEffect(() => {
    if (!processId || dashboard.state.processStatus?.status !== 'WRITTING') {
      return
    }

    navigate(
      `${AppRoute.Home}?process_id=${encodeURIComponent(processId)}`,
      { replace: true },
    )
  }, [dashboard.state.processStatus?.status, navigate, processId])

  return (
    <main
      className="review-result-page"
      aria-label={t('labsReviewer.result.title')}
    >
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

      <div className="review-result-page__content">
        {processId ? (
          <ReviewResultStatus
            agentDetail={dashboard.state.agentDetail}
            agentDetailError={dashboard.state.agentDetailError}
            editProcessHref={`${AppRoute.Home}?process_id=${encodeURIComponent(
              processId,
            )}`}
            isLoadingAgentDetail={dashboard.isLoadingAgentDetail}
            isPollingProcess={dashboard.isPollingProcess}
            onOpenAgentDetail={dashboard.loadAgentDetail}
            processStatus={dashboard.state.processStatus}
            processStatusError={dashboard.state.processStatusError}
          />
        ) : (
          <section className="review-result-page__missing">
            <div className="review-result-page__missing-panel">
              <p className="route-eyebrow">
                {t('labsReviewer.result.eyebrow')}
              </p>
              <h1 id="review-result-title">{t('labsReviewer.result.title')}</h1>
              <p className="route-copy">
                {t('labsReviewer.result.missingProcess')}
              </p>
              <nav
                className="route-links"
                aria-label={t('labsReviewer.result.navLabel')}
              >
                <Link to={AppRoute.Home}>
                  {t('labsReviewer.result.backHome')}
                </Link>
              </nav>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export default ReviewResultPage
