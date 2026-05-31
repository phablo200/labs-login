import { Link } from 'react-router-dom'
import AuthLayout from '../../features/auth/components/AuthLayout/AuthLayout'
import PasswordField from '../../features/auth/components/PasswordField/PasswordField'
import ProviderButtons from '../../features/auth/components/ProviderButtons/ProviderButtons'
import { AppRoute } from '../../routes/routes.enum'

function SignInPage() {
  return (
    <AuthLayout
      labelledBy="sign-in-title"
      subtitle="Enter your credentials to continue to your workspace."
      title="Sign in"
      footer={
        <p>
          New to MeLogin? <Link to={AppRoute.SignUp}>Create an account</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="sign-in-email">
            Email
          </label>
          <input
            autoComplete="email"
            className="auth-form__input"
            id="sign-in-email"
            name="email"
            placeholder="you@example.com"
            type="email"
          />
        </div>

        <PasswordField
          autoComplete="current-password"
          id="sign-in-password"
          label="Password"
          name="password"
          placeholder="Enter your password"
        />

        <div className="auth-form__row">
          <span className="auth-form__session-note">Secure session</span>
          <Link to={AppRoute.PasswordRecovery}>Forgot password?</Link>
        </div>

        <button className="auth-form__submit" disabled type="submit">
          Sign in
        </button>
      </form>

      <ProviderButtons />
    </AuthLayout>
  )
}

export default SignInPage
