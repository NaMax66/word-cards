export type InterfaceLanguage = 'en' | 'ru'

const supportedLanguages: InterfaceLanguage[] = ['en', 'ru']

export function getBrowserInterfaceLanguage(): InterfaceLanguage {
  if (typeof navigator === 'undefined') {
    return 'en'
  }

  const navigatorLanguages = navigator.languages || [navigator.language]
  const interfaceLanguage = detectInterfaceLanguage(navigatorLanguages)

  return interfaceLanguage
}

export function detectInterfaceLanguage(languages: readonly string[]): InterfaceLanguage {
  const normalizedLanguages = languages
    .filter(Boolean)
    .map(language => language.toLowerCase())

  for (const language of normalizedLanguages) {
    const supportedLanguage = supportedLanguages.find(
      supported => language === supported || language.startsWith(`${supported}-`)
    )

    if (supportedLanguage) {
      return supportedLanguage
    }
  }

  return 'en'
}
