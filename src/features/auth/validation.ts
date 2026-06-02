import type { TFunction } from 'i18next'
import { z } from 'zod'

export const PASSWORD_MIN_LENGTH = 8

function requiredString(t: TFunction) {
  return z.string().trim().min(1, t('validation.required'))
}

function emailString(t: TFunction) {
  return requiredString(t).email(t('validation.email'))
}

function passwordString(t: TFunction) {
  return requiredString(t).min(
    PASSWORD_MIN_LENGTH,
    t('validation.passwordMinLength', { count: PASSWORD_MIN_LENGTH }),
  )
}

export function createSignInSchema(t: TFunction) {
  return z.object({
    email: emailString(t),
    password: requiredString(t),
  })
}

export function createSignUpSchema(t: TFunction) {
  return z
    .object({
      name: requiredString(t),
      email: emailString(t),
      password: passwordString(t),
      confirmPassword: requiredString(t),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    })
}

export function createPasswordRecoverySchema(t: TFunction) {
  return z.object({
    email: emailString(t),
  })
}

export function createResetPasswordSchema(t: TFunction) {
  return z
    .object({
      token: requiredString(t),
      newPassword: passwordString(t),
      confirmPassword: requiredString(t),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    })
}

export type SignInFormValues = z.infer<ReturnType<typeof createSignInSchema>>
export type SignUpFormValues = z.infer<ReturnType<typeof createSignUpSchema>>
export type PasswordRecoveryFormValues = z.infer<
  ReturnType<typeof createPasswordRecoverySchema>
>
export type ResetPasswordFormValues = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>
