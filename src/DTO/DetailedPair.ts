export type DetailedPair = {
  origin: {
    value: string,
    markerId: string,
    lang?: string
  },
  translation: {
    value: string,
    markerId: string,
    lang?: string
  },
  id: number | string
}

export function isDetailedPair(pair: unknown): pair is DetailedPair {
  return Boolean(typeof pair === 'object' &&
      (<DetailedPair>pair).origin?.value &&
      (<DetailedPair>pair).origin?.markerId &&
      (<DetailedPair>pair).translation?.value &&
      (<DetailedPair>pair).translation?.markerId &&
      (<DetailedPair>pair).id
  )
}
