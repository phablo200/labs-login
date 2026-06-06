import type { TFunction } from 'i18next'
import { toast } from 'sonner'
import { ApiRequestError } from '../../lib/api'
import type { OAuthCallbackReason } from './types'

const oauthCallbackReasonTranslationKeys: Record<OAuthCallbackReason, string> = {
  oauth_account_conflict: 'providers.oauth.errors.accountConflict',
  oauth_code_exchange_failed: 'providers.oauth.errors.codeExchangeFailed',
  oauth_exchange_expired: 'providers.oauth.errors.exchangeExpired',
  oauth_exchange_invalid: 'providers.oauth.errors.exchangeInvalid',
  oauth_provider_error: 'providers.oauth.errors.provider',
  oauth_state_expired: 'providers.oauth.errors.stateExpired',
  oauth_state_invalid: 'providers.oauth.errors.stateInvalid',
  provider_email_unverified: 'providers.oauth.errors.emailUnverified',
  provider_not_supported: 'providers.oauth.errors.providerNotSupported',
}

export function showAuthErrorToast(error: unknown, t: TFunction): void {
  if (error instanceof ApiRequestError) {
    if (error.kind === 'backend') {
      toast.error(error.message)
      return
    }

    if (error.kind === 'network') {
      toast.error(t('errors.network'))
      return
    }

    if (error.kind === 'service' || error.kind === 'configuration') {
      toast.error(t('errors.serviceUnavailable'))
      return
    }

    if (error.kind === 'auth') {
      toast.error(t('errors.auth'))
      return
    }
  }

  toast.error(t('errors.unexpected'))
}

export function getOAuthCallbackReasonMessage(
  reason: OAuthCallbackReason,
  t: TFunction,
): string {
  return t(oauthCallbackReasonTranslationKeys[reason])
}
