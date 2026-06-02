import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AppRoute } from '../../routes/routes.enum'

function HomePage() {
  const { t } = useTranslation()

  return (
    <main className="route-page" aria-labelledby="home-title">
      <p className="route-eyebrow">{t('brand.name')}</p>
      <h1 id="home-title">{t('routes.home.title')}</h1>
      <p className="route-copy">{t('routes.home.copy')}</p>
      <nav className="route-links" aria-label={t('routes.home.navLabel')}>
        <Link to={AppRoute.SignIn}>{t('actions.signIn')}</Link>
        <Link to={AppRoute.SignUp}>{t('actions.signUp')}</Link>
      </nav>
    </main>
  )
}

export default HomePage
