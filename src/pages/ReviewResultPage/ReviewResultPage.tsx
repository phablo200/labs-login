import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import ReviewResultStatus from '../../features/labs-reviewer/components/ReviewResultStatus/ReviewResultStatus'
import { useLabsReviewerDashboard } from '../../features/labs-reviewer/hooks/useLabsReviewerDashboard'
import { AppRoute } from '../../routes/routes.enum'

function ReviewResultPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const processId = searchParams.get('process_id')
  const dashboard = useLabsReviewerDashboard(processId)

  return (
    <main className="labs-reviewer-page">
      {processId ? (
        <ReviewResultStatus
          agentDetail={dashboard.state.agentDetail}
          agentDetailError={dashboard.state.agentDetailError}
          isLoadingAgentDetail={dashboard.isLoadingAgentDetail}
          isPollingProcess={dashboard.isPollingProcess}
          onOpenAgentDetail={dashboard.loadAgentDetail}
          processId={processId}
          processStatus={dashboard.state.processStatus}
          processStatusError={dashboard.state.processStatusError}
        />
      ) : (
        <div className="labs-reviewer-result">
          <p className="route-eyebrow">{t('labsReviewer.result.eyebrow')}</p>
          <h1 id="review-result-title">{t('labsReviewer.result.title')}</h1>
          <p className="route-copy">
            {t('labsReviewer.result.missingProcess')}
          </p>
          <nav
            className="route-links"
            aria-label={t('labsReviewer.result.navLabel')}
          >
            <Link to={AppRoute.Home}>{t('labsReviewer.result.backHome')}</Link>
          </nav>
        </div>
      )}
    </main>
  )
}

export default ReviewResultPage
