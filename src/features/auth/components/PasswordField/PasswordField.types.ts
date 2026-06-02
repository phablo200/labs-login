import type { UseFormRegisterReturn } from 'react-hook-form'

export interface PasswordFieldProps {
  autoComplete: string
  error?: string
  id: string
  label: string
  name: string
  placeholder?: string
  registration?: UseFormRegisterReturn
}
