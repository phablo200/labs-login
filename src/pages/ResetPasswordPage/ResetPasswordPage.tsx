import { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import LoadingIcon from '../../components/ui/Icons/LoadingIcon'
import { resetPassword } from '../../features/auth/api'
import AuthLayout from '../../features/auth/components/AuthLayout/AuthLayout'
import PasswordField from '../../features/auth/components/PasswordField/PasswordField'
import { showAuthErrorToast } from '../../features/auth/toast'
import {
  createResetPasswordSchema,
  type ResetPasswordFormValues,
} from '../../features/auth/validation'
import { AppRoute } from '../../routes/routes.enum'

function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const resetPasswordSchema = useMemo(
    () => createResetPasswordSchema(t),
    [t],
  )
  const {
    formState: { errors, isSubmitting },
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

  async function handleValidResetPassword(values: ResetPasswordFormValues) {
    if (!token) {
      return
    }

    try {
      const response = await resetPassword({
        new_password: values.newPassword,
        token: values.token,
      })

      toast.success(response.message || t('auth.resetPassword.success'))
      navigate(AppRoute.SignIn)
    } catch (error) {
      showAuthErrorToast(error, t)
    }
  }

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

          <button
            aria-busy={isSubmitting}
            className="auth-form__submit"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <LoadingIcon className="auth-form__submit-icon" />
            ) : null}
            <span>{t('actions.resetPassword')}</span>
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
