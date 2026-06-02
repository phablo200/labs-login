import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { DEFAULT_LANGUAGE, type SupportedLanguage } from '../../../../lib/i18n.types'
import { normalizeLanguage } from '../../../../lib/language'

function LanguageSelector() {
  const { i18n, t } = useTranslation()
  const currentLanguage =
    normalizeLanguage(i18n.resolvedLanguage ?? i18n.language) ?? DEFAULT_LANGUAGE

  function handleLanguageChange(event: ChangeEvent<HTMLSelectElement>) {
    void i18n.changeLanguage(event.target.value as SupportedLanguage)
  }

  return (
    <label className="language-selector" htmlFor="auth-language">
      <span className="language-selector__label">{t('language.label')}</span>
      <select
        className="language-selector__control"
        id="auth-language"
        onChange={handleLanguageChange}
        value={currentLanguage}
      >
        <option value="en">{t('language.english')}</option>
        <option value="pt">{t('language.portuguese')}</option>
      </select>
    </label>
  )
}

export default LanguageSelector
