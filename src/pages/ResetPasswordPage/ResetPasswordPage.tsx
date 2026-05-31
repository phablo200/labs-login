import { Link, useSearchParams } from 'react-router-dom'
import { AppRoute } from '../../routes/routes.enum'

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  return (
    <main className="route-page" aria-labelledby="reset-password-title">
      <p className="route-eyebrow">MeLogin</p>
      <h1 id="reset-password-title">Reset password</h1>
      {token ? (
        <p className="route-copy">
          Recovery token detected. The reset password form will use this token
          when the auth flow is implemented.
        </p>
      ) : (
        <p className="route-copy" role="status">
          No recovery token was provided. Open this page from a password
          recovery email to continue.
        </p>
      )}
      <nav className="route-links" aria-label="Reset password related pages">
        <Link to={AppRoute.SignIn}>Back to sign in</Link>
        <Link to={AppRoute.PasswordRecovery}>Request recovery link</Link>
      </nav>
    </main>
  )
}

export default ResetPasswordPage
