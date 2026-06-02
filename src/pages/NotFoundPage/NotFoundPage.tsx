import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AppRoute } from '../../routes/routes.enum'

function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main className="route-page" aria-labelledby="not-found-title">
      <p className="route-eyebrow">{t('brand.name')}</p>
      <h1 id="not-found-title">{t('routes.notFound.title')}</h1>
      <p className="route-copy">{t('routes.notFound.copy')}</p>
      <nav className="route-links" aria-label={t('routes.notFound.navLabel')}>
        <Link to={AppRoute.SignIn}>{t('routes.notFound.signIn')}</Link>
      </nav>
    </main>
  )
}

export default NotFoundPage
