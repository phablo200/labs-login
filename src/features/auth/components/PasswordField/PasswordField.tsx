import { useState } from 'react'
import type { PasswordFieldProps } from './PasswordField.types'

function PasswordField({
  autoComplete,
  id,
  label,
  name,
  placeholder,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const inputType = isVisible ? 'text' : 'password'
  const toggleLabel = isVisible ? `Hide ${label}` : `Show ${label}`

  return (
    <div className="auth-form__field">
      <label className="auth-form__label" htmlFor={id}>
        {label}
      </label>
      <div className="auth-form__password-control">
        <input
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
          {isVisible ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  )
}

export default PasswordField
