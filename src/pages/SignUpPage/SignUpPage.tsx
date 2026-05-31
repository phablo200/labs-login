import { Link } from 'react-router-dom'
import AuthLayout from '../../features/auth/components/AuthLayout/AuthLayout'
import PasswordField from '../../features/auth/components/PasswordField/PasswordField'
import ProviderButtons from '../../features/auth/components/ProviderButtons/ProviderButtons'
import { AppRoute } from '../../routes/routes.enum'

function SignUpPage() {
  return (
    <AuthLayout
      labelledBy="sign-up-title"
      subtitle="Create your account with the details your team recognizes."
      title="Create account"
      footer={
        <p>
          Already have an account? <Link to={AppRoute.SignIn}>Sign in</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="sign-up-name">
            Name
          </label>
          <input
            autoComplete="name"
            className="auth-form__input"
            id="sign-up-name"
            name="name"
            placeholder="Your full name"
            type="text"
          />
        </div>

        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="sign-up-email">
            Email
          </label>
          <input
            autoComplete="email"
            className="auth-form__input"
            id="sign-up-email"
            name="email"
            placeholder="you@example.com"
            type="email"
          />
        </div>

        <PasswordField
          autoComplete="new-password"
          id="sign-up-password"
          label="Password"
          name="password"
          placeholder="Create a password"
        />

        <PasswordField
          autoComplete="new-password"
          id="sign-up-confirm-password"
          label="Confirm password"
          name="confirmPassword"
          placeholder="Repeat your password"
        />

        <button className="auth-form__submit" disabled type="submit">
          Create account
        </button>
      </form>

      <ProviderButtons />
    </AuthLayout>
  )
}

export default SignUpPage
