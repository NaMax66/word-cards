export const locale = {
  ru: 'ru',
  en: 'en'
} as const

export type Locale = typeof locale[keyof typeof locale] | string
