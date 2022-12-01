import type { Locale } from '@/types/Locale'

export type DetailedPair = {
  origin: {
    value: string,
    lang: Locale
  },
  translation: {
    value: string,
    lang: Locale
  }
}
