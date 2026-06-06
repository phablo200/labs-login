import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import GithubIcon from '../../../../components/ui/Icons/GithubIcon'
import GoogleIcon from '../../../../components/ui/Icons/GoogleIcon'
import { AppRoute } from '../../../../routes/routes.enum'
import {
  authorizeOAuthProvider,
  getOAuthProviders,
} from '../../api'
import { showAuthErrorToast } from '../../toast'
import type { OAuthProvider } from '../../types'

type ProviderButtonsState = 'loading' | 'ready' | 'unavailable'

const supportedProviders: OAuthProvider[] = ['google', 'github']

function ProviderButtons() {
  const { t } = useTranslation()
  const [enabledProviders, setEnabledProviders] = useState<OAuthProvider[]>([])
  const [status, setStatus] = useState<ProviderButtonsState>('loading')
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(
    null,
  )
  const enabledProviderSet = useMemo(
    () => new Set<OAuthProvider>(enabledProviders),
    [enabledProviders],
  )

  useEffect(() => {
    let isCurrent = true

    getOAuthProviders()
      .then((response) => {
        if (!isCurrent) {
          return
        }

        const nextEnabledProviders = supportedProviders.filter((provider) =>
          response.providers.some(
            (providerStatus) =>
              providerStatus.provider === provider && providerStatus.enabled,
          ),
        )

        setEnabledProviders(nextEnabledProviders)
        setStatus('ready')
      })
      .catch(() => {
        if (isCurrent) {
          setEnabledProviders([])
          setStatus('unavailable')
        }
      })

    return () => {
      isCurrent = false
    }
  }, [])

  async function handleProviderClick(provider: OAuthProvider) {
    const redirectUri = `${window.location.origin}${AppRoute.OAuthCallback}`

    try {
      setPendingProvider(provider)

      const response = await authorizeOAuthProvider(provider, {
        redirect_uri: redirectUri,
      })

      window.location.assign(response.authorization_url)
    } catch (error) {
      setPendingProvider(null)
      showAuthErrorToast(error, t)
    }
  }

  function getProviderTitle(provider: OAuthProvider): string {
    if (status === 'unavailable') {
      return t('providers.serviceUnavailable')
    }

    if (!enabledProviderSet.has(provider)) {
      return t(`providers.${provider}Unavailable`)
    }

    return t(`providers.${provider}`)
  }

  function isProviderDisabled(provider: OAuthProvider): boolean {
    return (
      status !== 'ready' ||
      !enabledProviderSet.has(provider) ||
      pendingProvider !== null
    )
  }

  return (
    <div className="auth-providers" aria-label={t('providers.label')}>
      <div className="auth-providers__divider">
        <span>{t('providers.divider')}</span>
      </div>
      <div className="auth-providers__buttons">
        <button
          aria-label={t('providers.google')}
          className="auth-provider-button"
          disabled={isProviderDisabled('google')}
          onClick={() => void handleProviderClick('google')}
          title={getProviderTitle('google')}
          type="button"
        >
          <GoogleIcon className="auth-provider-button__icon" />
          <span>
            {pendingProvider === 'google'
              ? t('providers.redirecting')
              : t('providers.googleShort')}
          </span>
        </button>
        <button
          aria-label={t('providers.github')}
          className="auth-provider-button"
          disabled={isProviderDisabled('github')}
          onClick={() => void handleProviderClick('github')}
          title={getProviderTitle('github')}
          type="button"
        >
          <GithubIcon className="auth-provider-button__icon auth-provider-button__icon--github" />
          <span>
            {pendingProvider === 'github'
              ? t('providers.redirecting')
              : t('providers.githubShort')}
          </span>
        </button>
      </div>
      {status === 'unavailable' ? (
        <p className="auth-providers__helper auth-providers__helper--error">
          {t('providers.serviceUnavailable')}
        </p>
      ) : (
        <p className="auth-providers__helper">
          {status === 'loading'
            ? t('providers.loading')
            : t('providers.helper')}
        </p>
      )}
    </div>
  )
}

export default ProviderButtons
