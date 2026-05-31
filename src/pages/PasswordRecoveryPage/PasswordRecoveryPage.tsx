import { Link } from 'react-router-dom'
import AuthLayout from '../../features/auth/components/AuthLayout/AuthLayout'
import { AppRoute } from '../../routes/routes.enum'

function PasswordRecoveryPage() {
  return (
    <AuthLayout
      labelledBy="password-recovery-title"
      subtitle="Enter your email and we will send recovery instructions when the account can receive them."
      title="Recover password"
      footer={
        <p>
          Remembered your password? <Link to={AppRoute.SignIn}>Sign in</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="password-recovery-email">
            Email
          </label>
          <input
            autoComplete="email"
            className="auth-form__input"
            id="password-recovery-email"
            name="email"
            placeholder="you@example.com"
            type="email"
          />
        </div>

        <button className="auth-form__submit" disabled type="submit">
          Send recovery link
        </button>
      </form>
    </AuthLayout>
  )
}

export default PasswordRecoveryPage
