export const SUPPORTED_LANGUAGES = ['en', 'pt'] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

export const LANGUAGE_STORAGE_KEY = 'labs-login.language'
