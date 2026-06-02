import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from './i18n.types'

function isSupportedLanguage(language: string): language is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)
}

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function getBrowserLanguages(): string[] {
  if (typeof navigator === 'undefined') {
    return []
  }

  return [navigator.language, ...navigator.languages]
}

export function normalizeLanguage(
  language?: string | null,
): SupportedLanguage | null {
  if (!language) {
    return null
  }

  const normalizedLanguage = language.toLowerCase()

  if (isSupportedLanguage(normalizedLanguage)) {
    return normalizedLanguage
  }

  if (normalizedLanguage.startsWith('pt-')) {
    return 'pt'
  }

  if (normalizedLanguage.startsWith('en-')) {
    return 'en'
  }

  return null
}

export function getStoredLanguage(): SupportedLanguage | null {
  const storage = getLocalStorage()

  if (!storage) {
    return null
  }

  try {
    return normalizeLanguage(storage.getItem(LANGUAGE_STORAGE_KEY))
  } catch {
    return null
  }
}

export function setStoredLanguage(language: SupportedLanguage): void {
  const storage = getLocalStorage()

  if (!storage) {
    return
  }

  try {
    storage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    return
  }
}

export function resolveInitialLanguage(): SupportedLanguage {
  const storedLanguage = getStoredLanguage()

  if (storedLanguage) {
    return storedLanguage
  }

  for (const browserLanguage of getBrowserLanguages()) {
    const normalizedLanguage = normalizeLanguage(browserLanguage)

    if (normalizedLanguage) {
      return normalizedLanguage
    }
  }

  return DEFAULT_LANGUAGE
}

export function setDocumentLanguage(language: SupportedLanguage): void {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.lang = language
}

export function getBackendLanguage(language?: string | null): SupportedLanguage {
  return normalizeLanguage(language) ?? getStoredLanguage() ?? DEFAULT_LANGUAGE
}
