import type { Locale } from '@/types/Locale'

export type DetailedPair = {
  origin: {
    value: string,
    lang: Locale
  },
  translation: {
    value: string,
    lang: Locale
  },
  id: number | string
}

export function isDetailedPair(pair: unknown): pair is DetailedPair {
  return Boolean(typeof pair === 'object' &&
      (<DetailedPair>pair).origin?.value &&
      (<DetailedPair>pair).origin?.lang &&
      (<DetailedPair>pair).translation?.value &&
      (<DetailedPair>pair).translation?.lang &&
      (<DetailedPair>pair).id
  )
}
