import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import EmailIcon from '../../components/ui/Icons/EmailIcon'
import { signIn } from '../../features/auth/api'
import AuthLayout from '../../features/auth/components/AuthLayout/AuthLayout'
import PasswordField from '../../features/auth/components/PasswordField/PasswordField'
import ProviderButtons from '../../features/auth/components/ProviderButtons/ProviderButtons'
import { showAuthErrorToast } from '../../features/auth/toast'
import {
  createSignInSchema,
  type SignInFormValues,
} from '../../features/auth/validation'
import { saveSessionToken } from '../../lib/session'
import { AppRoute } from '../../routes/routes.enum'

function SignInPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const signInSchema = useMemo(
    () => createSignInSchema(t),
    [t],
  )
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<SignInFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(signInSchema),
  })

  async function handleValidSignIn(values: SignInFormValues) {
    try {
      const response = await signIn({
        email: values.email,
        password: values.password,
      })

      saveSessionToken(response.token)
      navigate(AppRoute.Home)
    } catch (error) {
      console.log(error);
      showAuthErrorToast(error, t)
    }
  }

  return (
    <AuthLayout
      labelledBy="sign-in-title"
      subtitle={t('auth.signIn.subtitle')}
      title={t('auth.signIn.title')}
      footer={
        <p>
          {t('auth.signIn.footerPrefix')}{' '}
          <Link to={AppRoute.SignUp}>{t('auth.signIn.createAccount')}</Link>
        </p>
      }
    >
      <form
        className="auth-form"
        noValidate
        onSubmit={handleSubmit(handleValidSignIn)}
      >
        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="sign-in-email">
            {t('auth.fields.email')}
          </label>
          <div className="auth-form__input-control">
            <EmailIcon className="auth-form__field-icon" />
            <input
              {...register('email')}
              aria-describedby={
                errors.email ? 'sign-in-email-error' : undefined
              }
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              className={`auth-form__input auth-form__input--with-prefix${
                errors.email ? ' auth-form__input--error' : ''
              }`}
              id="sign-in-email"
              name="email"
              placeholder={t('auth.fields.emailPlaceholder')}
              type="email"
            />
          </div>
          {errors.email?.message ? (
            <p className="auth-form__error" id="sign-in-email-error">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <PasswordField
          autoComplete="current-password"
          error={errors.password?.message}
          id="sign-in-password"
          label={t('auth.fields.password')}
          name="password"
          placeholder={t('auth.fields.passwordPlaceholder')}
          registration={register('password')}
        />

        <div className="auth-form__row">
          <span className="auth-form__session-note">
            {t('auth.signIn.secureSession')}
          </span>
          <Link to={AppRoute.PasswordRecovery}>
            {t('auth.signIn.forgotPassword')}
          </Link>
        </div>

        <button
          className="auth-form__submit"
          disabled={isSubmitting}
          type="submit"
        >
          {t('actions.signIn')}
        </button>
      </form>

      <ProviderButtons />
    </AuthLayout>
  )
}

export default SignInPage
