import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import AuthLayout from '../../features/auth/components/AuthLayout/AuthLayout'
import {
  createPasswordRecoverySchema,
  type PasswordRecoveryFormValues,
} from '../../features/auth/validation'
import { AppRoute } from '../../routes/routes.enum'

function handleValidPasswordRecovery() {
  return undefined
}

function PasswordRecoveryPage() {
  const { t } = useTranslation()
  const passwordRecoverySchema = useMemo(
    () => createPasswordRecoverySchema(t),
    [t],
  )
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<PasswordRecoveryFormValues>({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(passwordRecoverySchema),
  })

  return (
    <AuthLayout
      labelledBy="password-recovery-title"
      subtitle={t('auth.passwordRecovery.subtitle')}
      title={t('auth.passwordRecovery.title')}
      footer={
        <p>
          <Trans
            i18nKey="auth.passwordRecovery.footer"
            components={{ link: <Link to={AppRoute.SignIn} /> }}
          />
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
          <input
            {...register('email')}
            aria-describedby={
              errors.email ? 'password-recovery-email-error' : undefined
            }
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className={`auth-form__input${
              errors.email ? ' auth-form__input--error' : ''
            }`}
            id="password-recovery-email"
            name="email"
            placeholder={t('auth.fields.emailPlaceholder')}
            type="email"
          />
          {errors.email?.message ? (
            <p className="auth-form__error" id="password-recovery-email-error">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <button className="auth-form__submit" type="submit">
          {t('actions.sendRecoveryLink')}
        </button>
      </form>
    </AuthLayout>
  )
}

export default PasswordRecoveryPage
