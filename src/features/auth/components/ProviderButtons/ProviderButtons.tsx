import { useTranslation } from 'react-i18next'

function ProviderButtons() {
  const { t } = useTranslation()

  return (
    <div className="auth-providers" aria-label={t('providers.label')}>
      <div className="auth-providers__divider">
        <span>{t('providers.divider')}</span>
      </div>
      <div className="auth-providers__buttons">
        <button
          className="auth-provider-button"
          disabled
          title={t('providers.googleUnavailable')}
          type="button"
        >
          {t('providers.google')}
        </button>
        <button
          className="auth-provider-button"
          disabled
          title={t('providers.githubUnavailable')}
          type="button"
        >
          {t('providers.github')}
        </button>
      </div>
      <p className="auth-providers__helper">{t('providers.helper')}</p>
    </div>
  )
}

export default ProviderButtons
