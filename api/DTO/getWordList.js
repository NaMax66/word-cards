export function getWordList(rowPairs) {
  return rowPairs.map(({ origin_lang, origin, translation, translation_lang  }) => {
    return {
      [origin_lang]: origin,
      [translation_lang]: translation
    }
  })
}
