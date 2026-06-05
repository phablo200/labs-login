import type { TFunction } from 'i18next'
import { toast } from 'sonner'
import { ApiRequestError } from '../../lib/api'

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
