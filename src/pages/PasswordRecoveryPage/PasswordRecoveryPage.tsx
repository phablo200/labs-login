import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import EmailIcon from '../../components/ui/Icons/EmailIcon'
import LoadingIcon from '../../components/ui/Icons/LoadingIcon'
import { requestPasswordRecovery } from '../../features/auth/api'
import AuthLayout from '../../features/auth/components/AuthLayout/AuthLayout'
import { showAuthErrorToast } from '../../features/auth/toast'
import {
  createPasswordRecoverySchema,
  type PasswordRecoveryFormValues,
} from '../../features/auth/validation'
import { AppRoute } from '../../routes/routes.enum'

function PasswordRecoveryPage() {
  const { t } = useTranslation()
  const passwordRecoverySchema = useMemo(
    () => createPasswordRecoverySchema(t),
    [t],
  )
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<PasswordRecoveryFormValues>({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(passwordRecoverySchema),
  })

  async function handleValidPasswordRecovery(
    values: PasswordRecoveryFormValues,
  ) {
    try {
      const response = await requestPasswordRecovery({
        email: values.email,
      })

      toast.success(response.message || t('auth.passwordRecovery.success'))
    } catch (error) {
      showAuthErrorToast(error, t)
    }
  }

  return (
    <AuthLayout
      labelledBy="password-recovery-title"
      subtitle={t('auth.passwordRecovery.subtitle')}
      title={t('auth.passwordRecovery.title')}
      footer={
        <p>
          {t('auth.passwordRecovery.footerPrefix')}{' '}
          <Link to={AppRoute.SignIn}>{t('actions.signIn')}</Link>
        </p>
      }
    >
      <form
        className="auth-form"
        noValidate
        onSubmit={handleSubmit(handleValidPasswordRecovery)}
      >
        <div className="auth-form__field">
          <label className="auth-form__label" htmlFor="password-recovery-email">
            {t('auth.fields.email')}
          </label>
          <div className="auth-form__input-control">
            <EmailIcon className="auth-form__field-icon" />
            <input
              {...register('email')}
              aria-describedby={
                errors.email ? 'password-recovery-email-error' : undefined
              }
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              className={`auth-form__input auth-form__input--with-prefix${
                errors.email ? ' auth-form__input--error' : ''
              }`}
              id="password-recovery-email"
              name="email"
              placeholder={t('auth.fields.emailPlaceholder')}
              type="email"
            />
          </div>
          {errors.email?.message ? (
            <p className="auth-form__error" id="password-recovery-email-error">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <button
          aria-busy={isSubmitting}
          className="auth-form__submit"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? (
            <LoadingIcon className="auth-form__submit-icon" />
          ) : null}
          <span>{t('actions.sendRecoveryLink')}</span>
        </button>
      </form>
    </AuthLayout>
  )
}

export default PasswordRecoveryPage
