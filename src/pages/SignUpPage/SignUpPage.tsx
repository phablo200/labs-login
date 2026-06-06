import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import EmailIcon from '../../components/ui/Icons/EmailIcon'
import { signUp } from '../../features/auth/api'
import AuthLayout from '../../features/auth/components/AuthLayout/AuthLayout'
import PasswordField from '../../features/auth/components/PasswordField/PasswordField'
import ProviderButtons from '../../features/auth/components/ProviderButtons/ProviderButtons'
import { showAuthErrorToast } from '../../features/auth/toast'
import {
  createSignUpSchema,
  type SignUpFormValues,
} from '../../features/auth/validation'
import { saveSessionToken } from '../../lib/session'
import { AppRoute } from '../../routes/routes.enum'

function SignUpPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const signUpSchema = useMemo(
    () => createSignUpSchema(t),
    [t],
  )
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<SignUpFormValues>({
    defaultValues: {
      confirmPassword: '',
      email: '',
      name: '',
      password: '',
    },
    resolver: zodResolver(signUpSchema),
  })

  async function handleValidSignUp(values: SignUpFormValues) {
    try {
      const response = await signUp({
        email: values.email,
        name: values.name,
        password: values.password,
      })

      saveSessionToken(response.token)
      navigate(AppRoute.Home)
    } catch (error) {
      showAuthErrorToast(error, t)
    }
  }

  return (
    <AuthLayout
      labelledBy="sign-up-title"
      subtitle={t('auth.signUp.subtitle')}
      title={t('auth.signUp.title')}
      footer={
        <p>
          {t('auth.signUp.footerPrefix')}{' '}
          <Link to={AppRoute.SignIn}>{t('actions.signIn')}</Link>
        </p>
      }
    >
      <form
        className="auth-form"
        noValidate
        onSubmit={handleSubmit(handleValidSignUp)}
      >
        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="sign-up-name">
            {t('auth.fields.name')}
          </label>
          <input
            {...register('name')}
            aria-describedby={errors.name ? 'sign-up-name-error' : undefined}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            className={`auth-form__input${
              errors.name ? ' auth-form__input--error' : ''
            }`}
            id="sign-up-name"
            name="name"
            placeholder={t('auth.fields.namePlaceholder')}
            type="text"
          />
          {errors.name?.message ? (
            <p className="auth-form__error" id="sign-up-name-error">
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="sign-up-email">
            {t('auth.fields.email')}
          </label>
          <div className="auth-form__input-control">
            <EmailIcon className="auth-form__field-icon" />
            <input
              {...register('email')}
              aria-describedby={
                errors.email ? 'sign-up-email-error' : undefined
              }
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              className={`auth-form__input auth-form__input--with-prefix${
                errors.email ? ' auth-form__input--error' : ''
              }`}
              id="sign-up-email"
              name="email"
              placeholder={t('auth.fields.emailPlaceholder')}
              type="email"
            />
          </div>
          {errors.email?.message ? (
            <p className="auth-form__error" id="sign-up-email-error">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <PasswordField
          autoComplete="new-password"
          error={errors.password?.message}
          id="sign-up-password"
          label={t('auth.fields.password')}
          name="password"
          placeholder={t('auth.fields.newPasswordPlaceholder')}
          registration={register('password')}
        />

        <PasswordField
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          id="sign-up-confirm-password"
          label={t('auth.fields.confirmPassword')}
          name="confirmPassword"
          placeholder={t('auth.fields.confirmPasswordPlaceholder')}
          registration={register('confirmPassword')}
        />

        <button
          className="auth-form__submit"
          disabled={isSubmitting}
          type="submit"
        >
          {t('actions.createAccount')}
        </button>
      </form>

      <ProviderButtons />
    </AuthLayout>
  )
}

export default SignUpPage
