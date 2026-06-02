import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import AuthLayout from '../../features/auth/components/AuthLayout/AuthLayout'
import PasswordField from '../../features/auth/components/PasswordField/PasswordField'
import {
  createResetPasswordSchema,
  type ResetPasswordFormValues,
} from '../../features/auth/validation'
import { AppRoute } from '../../routes/routes.enum'

function handleValidResetPassword() {
  return undefined
}

function ResetPasswordPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const resetPasswordSchema = useMemo(
    () => createResetPasswordSchema(t),
    [t],
  )
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ResetPasswordFormValues>({
    defaultValues: {
      confirmPassword: '',
      newPassword: '',
      token,
    },
    resolver: zodResolver(resetPasswordSchema),
  })

  return (
    <AuthLayout
      labelledBy="reset-password-title"
      subtitle={t('auth.resetPassword.subtitle')}
      title={t('auth.resetPassword.title')}
      footer={
        <p>
          <Link to={AppRoute.SignIn}>{t('actions.signIn')}</Link>
        </p>
      }
    >
      {token ? (
        <form
          className="auth-form"
          noValidate
          onSubmit={handleSubmit(handleValidResetPassword)}
        >
          <input type="hidden" {...register('token')} />
          <p className="auth-form__notice">{t('auth.resetPassword.detected')}</p>

          <PasswordField
            autoComplete="new-password"
            error={errors.newPassword?.message}
            id="reset-password-new-password"
            label={t('auth.fields.password')}
            name="newPassword"
            placeholder={t('auth.fields.newPasswordPlaceholder')}
            registration={register('newPassword')}
          />

          <PasswordField
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            id="reset-password-confirm-password"
            label={t('auth.fields.confirmPassword')}
            name="confirmPassword"
            placeholder={t('auth.fields.confirmPasswordPlaceholder')}
            registration={register('confirmPassword')}
          />

          <button className="auth-form__submit" type="submit">
            {t('actions.resetPassword')}
          </button>
        </form>
      ) : (
        <div className="auth-form__notice-stack" role="status">
          <p className="auth-form__notice">{t('auth.resetPassword.missing')}</p>
          <Link to={AppRoute.PasswordRecovery}>
            {t('actions.requestRecoveryLink')}
          </Link>
        </div>
      )}
    </AuthLayout>
  )
}

export default ResetPasswordPage
