import { useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { getMe } from '../features/auth/api'
import {
  clearStoredAuthenticatedUser,
  saveAuthenticatedUser,
} from '../features/auth/userStorage'
import { clearSessionToken, getSessionToken } from '../lib/session'
import { AppRoute } from './routes.enum'

type ProtectedRouteProps = {
  children: ReactNode
}

type TokenValidationState = 'anonymous' | 'authenticated' | 'checking'

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { t } = useTranslation()
  const [status, setStatus] = useState<TokenValidationState>(() =>
    getSessionToken() ? 'checking' : 'anonymous',
  )

  useEffect(() => {
    const token = getSessionToken()
    let isCurrent = true

    if (!token) {
      return
    }

    getMe(token)
      .then((user) => {
        if (isCurrent) {
          saveAuthenticatedUser(user)
          setStatus('authenticated')
        }
      })
      .catch(() => {
        if (isCurrent) {
          clearSessionToken()
          clearStoredAuthenticatedUser()
          setStatus('anonymous')
        }
      })

    return () => {
      isCurrent = false
    }
  }, [])

  if (status === 'checking') {
    return (
      <main className="route-page" aria-busy="true">
        <p className="route-copy">{t('routes.home.validatingSession')}</p>
      </main>
    )
  }

  if (status === 'anonymous') {
    return <Navigate to={AppRoute.SignIn} replace />
  }

  return children
}

export default ProtectedRoute
