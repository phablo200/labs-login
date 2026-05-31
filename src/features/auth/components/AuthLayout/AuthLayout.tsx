import heroImage from '../../../../assets/hero.png'
import type { AuthLayoutProps } from './AuthLayout.types'

function AuthLayout({
  children,
  footer,
  labelledBy,
  subtitle,
  title,
}: AuthLayoutProps) {
  return (
    <main className="auth-layout" aria-labelledby={labelledBy}>
      <section className="auth-layout__brand" aria-label="MeLogin">
        <div className="auth-layout__brand-content">
          <p className="auth-layout__eyebrow">MeLogin</p>
          <h2 className="auth-layout__brand-title">
            Access your workspace securely.
          </h2>
          <p className="auth-layout__brand-copy">
            A focused authentication experience for teams that need clear,
            reliable access.
          </p>
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
        <div className="auth-layout__form-shell">
          <div className="auth-layout__mobile-brand" aria-hidden="true">
            MeLogin
          </div>
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
