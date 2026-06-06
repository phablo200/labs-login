import { useTranslation } from 'react-i18next'
import heroImage from '../../../../assets/hero.png'
import LanguageSelector from '../LanguageSelector/LanguageSelector'
import type { AuthLayoutProps } from './AuthLayout.types'

function AuthLayout({
  children,
  footer,
  labelledBy,
  subtitle,
  title,
}: AuthLayoutProps) {
  const { t } = useTranslation()

  return (
    <main className="auth-layout" aria-labelledby={labelledBy}>
      <section className="auth-layout__brand" aria-label={t('brand.ariaLabel')}>
        <div className="auth-layout__brand-content">
          <p className="auth-layout__eyebrow">{t('brand.name')}</p>
          <h2 className="auth-layout__brand-title">{t('brand.title')}</h2>
          <p className="auth-layout__brand-copy">{t('brand.copy')}</p>
        </div>
        <div className="auth-layout__hero-wrap" aria-hidden="true">
          <img
            className="auth-layout__hero"
            src={heroImage}
            alt=""
            draggable="false"
          />
        </div>
      </section>

      <section className="auth-layout__panel">
        <div className="auth-layout__topbar">
          <div className="auth-layout__mobile-brand" aria-hidden="true">
            {t('brand.name')}
          </div>
          <LanguageSelector />
        </div>
        <div className="auth-layout__form-shell">
          <div className="auth-layout__header">
            <h1 id={labelledBy}>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
          {footer ? <div className="auth-layout__footer">{footer}</div> : null}
        </div>
      </section>
    </main>
  )
}

export default AuthLayout
