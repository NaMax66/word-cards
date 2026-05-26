export type InterfaceLanguage = 'en' | 'ru'

const supportedLanguages: InterfaceLanguage[] = ['en', 'ru']

export function getBrowserInterfaceLanguage(): InterfaceLanguage {
  if (typeof navigator === 'undefined') return 'en'

  return detectInterfaceLanguage(navigator.languages || [navigator.language])
}

export function detectInterfaceLanguage(languages: readonly string[]): InterfaceLanguage {
  const normalizedLanguages = languages
    .filter(Boolean)
    .map(language => language.toLowerCase())

  for (const supportedLanguage of supportedLanguages) {
    if (normalizedLanguages.some(language => language === supportedLanguage || language.startsWith(`${supportedLanguage}-`))) {
      return supportedLanguage
    }
  }

  return 'en'
}
