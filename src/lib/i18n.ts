import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './i18n.types'
import {
  getBackendLanguage,
  resolveInitialLanguage,
  setDocumentLanguage,
  setStoredLanguage,
} from './language'
import { resources } from './i18n/resources'

const initialLanguage = resolveInitialLanguage()

setDocumentLanguage(initialLanguage)

i18n.use(initReactI18next).init({
  debug: import.meta.env.DEV,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
  lng: initialLanguage,
  resources,
  returnEmptyString: false,
  supportedLngs: [...SUPPORTED_LANGUAGES],
  parseMissingKeyHandler: (key) => (import.meta.env.DEV ? key : ''),
})

i18n.on('languageChanged', (language) => {
  const backendLanguage = getBackendLanguage(language)

  setStoredLanguage(backendLanguage)
  setDocumentLanguage(backendLanguage)
})

export default i18n
