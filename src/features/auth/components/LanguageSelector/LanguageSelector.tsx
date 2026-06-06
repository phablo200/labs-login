import { useEffect, useId, useRef, useState } from 'react'
import type { ComponentType, SVGProps } from 'react'
import { useTranslation } from 'react-i18next'
import BrazilIcon from '../../../../components/ui/Icons/BrazilIcon'
import USAIcon from '../../../../components/ui/Icons/USAIcon'
import { DEFAULT_LANGUAGE, type SupportedLanguage } from '../../../../lib/i18n.types'
import { normalizeLanguage } from '../../../../lib/language'

type LanguageOption = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  labelKey: 'language.english' | 'language.portuguese'
  shortLabel: string
  value: SupportedLanguage
}

const languageOptions: LanguageOption[] = [
  {
    Icon: USAIcon,
    labelKey: 'language.english',
    shortLabel: 'EN',
    value: 'en',
  },
  {
    Icon: BrazilIcon,
    labelKey: 'language.portuguese',
    shortLabel: 'PT',
    value: 'pt',
  },
]

function LanguageSelector() {
  const { i18n, t } = useTranslation()
  const dropdownId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const currentLanguage =
    normalizeLanguage(i18n.resolvedLanguage ?? i18n.language) ?? DEFAULT_LANGUAGE
  const currentOption =
    languageOptions.find((option) => option.value === currentLanguage) ??
    languageOptions[0]
  const CurrentIcon = currentOption.Icon

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    function handleDocumentKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleDocumentKeyDown)

    return () => {
      document.removeEventListener('click', handleDocumentClick)
      document.removeEventListener('keydown', handleDocumentKeyDown)
    }
  }, [])

  function handleLanguageChange(language: SupportedLanguage) {
    void i18n.changeLanguage(language)
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className="language-selector" ref={containerRef}>
      <button
        aria-controls={isOpen ? dropdownId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`${t('language.label')}: ${t(currentOption.labelKey)}`}
        className="language-selector__button"
        onClick={() => setIsOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        <CurrentIcon className="language-selector__flag" />
        <span className="language-selector__current">{currentOption.shortLabel}</span>
        <span className="language-selector__chevron" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div
          aria-label={t('language.label')}
          className="language-selector__menu"
          id={dropdownId}
          role="menu"
        >
          {languageOptions.map((option) => {
            const OptionIcon = option.Icon
            const isSelected = option.value === currentLanguage

            return (
              <button
                aria-checked={isSelected}
                className="language-selector__option"
                key={option.value}
                onClick={() => handleLanguageChange(option.value)}
                role="menuitemradio"
                type="button"
              >
                <OptionIcon className="language-selector__flag" />
                <span>{t(option.labelKey)}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default LanguageSelector
