export const locale = {
  ru: 'ru',
  en: 'en',
  sr: 'sr',
  it: 'it',
  kz: 'kz',
  fr: 'fr'
} as const

export type Locale = typeof locale[keyof typeof locale] | string
