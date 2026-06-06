import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from '../pages/HomePage/HomePage'
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage'
import OAuthCallbackPage from '../pages/OAuthCallbackPage/OAuthCallbackPage'
import PasswordRecoveryPage from '../pages/PasswordRecoveryPage/PasswordRecoveryPage'
import ResetPasswordPage from '../pages/ResetPasswordPage/ResetPasswordPage'
import SignInPage from '../pages/SignInPage/SignInPage'
import SignUpPage from '../pages/SignUpPage/SignUpPage'
import ProtectedRoute from './ProtectedRoute'
import { AppRoute } from './routes.enum'

function AppRouter() {
  return (
    <Routes>
      <Route
        path={AppRoute.Root}
        element={<Navigate to={AppRoute.SignIn} replace />}
      />
      <Route path={AppRoute.SignIn} element={<SignInPage />} />
      <Route path={AppRoute.SignUp} element={<SignUpPage />} />
      <Route
        path={AppRoute.PasswordRecovery}
        element={<PasswordRecoveryPage />}
      />
      <Route path={AppRoute.ResetPassword} element={<ResetPasswordPage />} />
      <Route
        path={AppRoute.OAuthCallback}
        element={<OAuthCallbackPage />}
      />
      <Route
        path={AppRoute.Home}
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route path={AppRoute.NotFound} element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter
