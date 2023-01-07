export function getWordList(rowPairs) {
  return rowPairs.map(({ pair_uid, origin_lang, origin, translation, translation_lang  }) => {
    return {
      id: pair_uid,
      pair: {
        [origin_lang]: origin,
        [translation_lang]: translation
      }
    }
  })
}
