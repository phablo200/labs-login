import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { PasswordFieldProps } from './PasswordField.types'

function PasswordField({
  autoComplete,
  error,
  id,
  label,
  name,
  placeholder,
  registration,
}: PasswordFieldProps) {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const inputType = isVisible ? 'text' : 'password'
  const toggleLabel = t(isVisible ? 'actions.hideField' : 'actions.showField', {
    field: label,
  })
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="auth-form__field">
      <label className="auth-form__label" htmlFor={id}>
        {label}
      </label>
      <div className="auth-form__password-control">
        <input
          {...registration}
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className="auth-form__input auth-form__input--password"
          id={id}
          name={name}
          placeholder={placeholder}
          type={inputType}
        />
        <button
          aria-label={toggleLabel}
          className="auth-form__password-toggle"
          onClick={() => setIsVisible((current) => !current)}
          type="button"
        >
          {t(isVisible ? 'actions.hidePassword' : 'actions.showPassword')}
        </button>
      </div>
      {error ? (
        <p className="auth-form__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default PasswordField
