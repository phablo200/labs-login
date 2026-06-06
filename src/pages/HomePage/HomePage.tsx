import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import SignOut from '../../components/ui/Icons/SignOut'
import { clearSessionToken } from '../../lib/session'
import { AppRoute } from '../../routes/routes.enum'

function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  function handleLogout() {
    clearSessionToken()
    navigate(AppRoute.SignIn, { replace: true })
  }

  return (
    <main className="route-page" aria-labelledby="home-title">
      <div className="route-session-actions">
        <button
          className="route-logout-button"
          onClick={handleLogout}
          type="button"
        >
          <SignOut className="route-logout-button__icon" />
          {t('actions.logout')}
        </button>
      </div>
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
