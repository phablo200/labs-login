import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { AppRoute } from '../../routes/routes.enum'

function ReviewResultPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const processId = searchParams.get('process_id')

  return (
    <main className="labs-reviewer-page" aria-labelledby="review-result-title">
      <div className="labs-reviewer-result">
        <p className="route-eyebrow">{t('labsReviewer.result.eyebrow')}</p>
        <h1 id="review-result-title">{t('labsReviewer.result.title')}</h1>
        {processId ? (
          <>
            <p className="route-copy">{t('labsReviewer.result.copy')}</p>
            <dl className="labs-reviewer-process__metadata">
              <div>
                <dt>{t('labsReviewer.process.processId')}</dt>
                <dd>{processId}</dd>
              </div>
            </dl>
          </>
        ) : (
          <>
            <p className="route-copy">
              {t('labsReviewer.result.missingProcess')}
            </p>
            <nav
              className="route-links"
              aria-label={t('labsReviewer.result.navLabel')}
            >
              <Link to={AppRoute.Home}>{t('labsReviewer.result.backHome')}</Link>
            </nav>
          </>
        )}
      </div>
    </main>
  )
}

export default ReviewResultPage
