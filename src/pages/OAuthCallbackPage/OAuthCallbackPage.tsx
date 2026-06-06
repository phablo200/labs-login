import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { exchangeOAuthCode } from '../../features/auth/api'
import AuthLayout from '../../features/auth/components/AuthLayout/AuthLayout'
import {
  getOAuthCallbackReasonMessage,
  showAuthErrorToast,
} from '../../features/auth/toast'
import type {
  OAuthCallbackReason,
  OAuthCallbackStatus,
} from '../../features/auth/types'
import { saveSessionToken } from '../../lib/session'
import { AppRoute } from '../../routes/routes.enum'

function isOAuthCallbackStatus(
  status: string | null,
): status is OAuthCallbackStatus {
  return status === 'error' || status === 'success'
}

function isOAuthCallbackReason(
  reason: string | null,
): reason is OAuthCallbackReason {
  return (
    reason === 'oauth_account_conflict' ||
    reason === 'oauth_code_exchange_failed' ||
    reason === 'oauth_exchange_expired' ||
    reason === 'oauth_exchange_invalid' ||
    reason === 'oauth_provider_error' ||
    reason === 'oauth_state_expired' ||
    reason === 'oauth_state_invalid' ||
    reason === 'provider_email_unverified' ||
    reason === 'provider_not_supported'
  )
}

function OAuthCallbackPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const hasProcessedCallback = useRef(false)

  useEffect(() => {
    if (hasProcessedCallback.current) {
      return
    }

    hasProcessedCallback.current = true

    const status = searchParams.get('status')
    const code = searchParams.get('code')
    const reason = searchParams.get('reason')

    async function processCallback() {
      if (!isOAuthCallbackStatus(status)) {
        toast.error(t('providers.oauth.errors.callback'))
        navigate(AppRoute.SignIn, { replace: true })
        return
      }

      if (status === 'error') {
        toast.error(
          isOAuthCallbackReason(reason)
            ? getOAuthCallbackReasonMessage(reason, t)
            : t('providers.oauth.errors.callback'),
        )
        navigate(AppRoute.SignIn, { replace: true })
        return
      }

      if (!code) {
        toast.error(t('providers.oauth.errors.callback'))
        navigate(AppRoute.SignIn, { replace: true })
        return
      }

      try {
        const response = await exchangeOAuthCode({ code })

        saveSessionToken(response.token)
        toast.success(t('providers.oauth.success'))
      } catch (error) {
        showAuthErrorToast(error, t)
      } finally {
        navigate(AppRoute.SignIn, { replace: true })
      }
    }

    void processCallback()
  }, [navigate, searchParams, t])

  return (
    <AuthLayout
      labelledBy="oauth-callback-title"
      subtitle={t('providers.oauth.callbackSubtitle')}
      title={t('providers.oauth.callbackTitle')}
    >
      <div className="auth-form__notice" aria-live="polite" aria-busy="true">
        {t('providers.oauth.processing')}
      </div>
    </AuthLayout>
  )
}

export default OAuthCallbackPage
