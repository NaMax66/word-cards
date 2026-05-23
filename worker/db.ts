export type PairInput = {
  origin: WordValue
  translation: WordValue
}

export type Pair = PairInput & {
  id: string
}

export type UserInput = {
  userUid: string
  name: string | null
  givenName: string | null
  email: string | null
  picture: string | null
}

export type UserData = {
  name: string | null
  picture: string | null
  settings: string | null
}

type WordValue = {
  value: string
  lang: string
}

type PairRow = {
  id: number
  pair_uid: string
  origin: string
  origin_lang: string
  translation: string
  translation_lang: string
}

type UserDataRow = {
  name: string | null
  picture: string | null
  settings: string | null
}

export type WordListParams = {
  limit?: number
  cursor?: string | null
  search?: string | null
}

export type WordListPage = {
  items: Pair[]
  nextCursor: string | null
}

export async function ensureUser(db: D1Database, user: UserInput) {
  await db.prepare(
    `INSERT INTO users (user_uid, name, given_name, email, picture)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_uid) DO UPDATE SET
       name = excluded.name,
       given_name = excluded.given_name,
       email = excluded.email,
       picture = excluded.picture`
  ).bind(
    user.userUid,
    user.name,
    user.givenName,
    user.email,
    user.picture
  ).run()
}

export async function getWordList(db: D1Database, userUid: string, params: WordListParams = {}): Promise<WordListPage> {
  const limit = clampLimit(params.limit)
  const search = normalizeSearch(params.search)
  const rawSearch = params.search?.trim()
  const cursor = normalizeCursor(params.cursor)
  const bindings: Array<string | number> = [userUid]
  const where = ['user_uid = ?']

  if (cursor) {
    where.push('id < ?')
    bindings.push(cursor)
  }

  if (search) {
    where.push(`(
      origin_search LIKE ? ESCAPE '\\'
      OR translation_search LIKE ? ESCAPE '\\'
      OR origin LIKE ? ESCAPE '\\'
      OR translation LIKE ? ESCAPE '\\'
    )`)
    const pattern = `%${escapeLike(search)}%`
    const rawPattern = `%${escapeLike(rawSearch || search)}%`
    bindings.push(pattern, pattern, rawPattern, rawPattern)
  }

  bindings.push(limit + 1)

  const { results } = await db.prepare(
    `SELECT id, pair_uid, origin, origin_lang, translation, translation_lang
     FROM pairs
     WHERE ${where.join(' AND ')}
     ORDER BY id DESC
     LIMIT ?`
  ).bind(...bindings).all<PairRow>()

  const items = results.slice(0, limit)
  const nextCursor = results.length > limit ? String(items[items.length - 1]?.id) : null

  return {
    items: items.map(toPair),
    nextCursor
  }
}

export async function getRandomPair(db: D1Database, userUid: string, excludedPairUid?: string | null) {
  const bindings: string[] = [userUid]
  const where = ['user_uid = ?']

  if (excludedPairUid) {
    where.push('pair_uid != ?')
    bindings.push(excludedPairUid)
  }

  const row = await db.prepare(
    `SELECT id, pair_uid, origin, origin_lang, translation, translation_lang
     FROM pairs
     WHERE ${where.join(' AND ')}
     ORDER BY RANDOM()
     LIMIT 1`
  ).bind(...bindings).first<PairRow>()

  return row ? toPair(row) : null
}

export async function getPairsCount(db: D1Database, userUid: string) {
  const row = await db.prepare(
    `SELECT COUNT(*) AS count
     FROM pairs
     WHERE user_uid = ?`
  ).bind(userUid).first<{ count: number }>()

  return row?.count || 0
}

export async function addPair(db: D1Database, userUid: string, uid: string, pair: PairInput) {
  await db.prepare(
    `INSERT INTO pairs (
       user_uid,
       pair_uid,
       origin,
       origin_lang,
       translation,
       translation_lang,
       origin_search,
       translation_search
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    userUid,
    uid,
    pair.origin.value,
    pair.origin.lang,
    pair.translation.value,
    pair.translation.lang,
    toSearchValue(pair.origin.value),
    toSearchValue(pair.translation.value)
  ).run()
}

export async function updatePair(db: D1Database, userUid: string, pair: Pair) {
  const result = await db.prepare(
    `UPDATE pairs
     SET origin = ?,
         origin_lang = ?,
         translation = ?,
         translation_lang = ?,
         origin_search = ?,
         translation_search = ?
     WHERE user_uid = ? AND pair_uid = ?`
  ).bind(
    pair.origin.value,
    pair.origin.lang,
    pair.translation.value,
    pair.translation.lang,
    toSearchValue(pair.origin.value),
    toSearchValue(pair.translation.value),
    userUid,
    pair.id
  ).run()

  return result.meta.changes > 0
}

export async function removePair(db: D1Database, userUid: string, pairUid: string) {
  const result = await db.prepare(
    'DELETE FROM pairs WHERE user_uid = ? AND pair_uid = ?'
  ).bind(userUid, pairUid).run()

  return result.meta.changes > 0
}

export async function getUserData(db: D1Database, userUid: string) {
  return db.prepare(
    `SELECT users.name, users.picture, user_settings.settings
     FROM users
     LEFT JOIN user_settings ON user_settings.user_uid = users.user_uid
     WHERE users.user_uid = ?`
  ).bind(userUid).first<UserDataRow>()
}

export async function updateUserSettings(db: D1Database, userUid: string, settings: string) {
  await db.prepare(
    `INSERT INTO user_settings (user_uid, settings)
     VALUES (?, ?)
     ON CONFLICT(user_uid) DO UPDATE SET settings = excluded.settings`
  ).bind(userUid, settings).run()
}

function toPair(row: PairRow): Pair {
  return {
    id: row.pair_uid,
    origin: {
      value: row.origin,
      lang: row.origin_lang
    },
    translation: {
      value: row.translation,
      lang: row.translation_lang
    }
  }
}

function clampLimit(limit: number | undefined) {
  if (!limit || Number.isNaN(limit)) return 50

  return Math.min(Math.max(Math.floor(limit), 1), 100)
}

function normalizeCursor(cursor: string | null | undefined) {
  if (!cursor) return null

  const value = Number(cursor)

  return Number.isInteger(value) && value > 0 ? value : null
}

function normalizeSearch(search: string | null | undefined) {
  const value = search?.trim()

  return value ? toSearchValue(value) : null
}

function toSearchValue(value: string) {
  return value.trim().toLocaleLowerCase()
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, match => `\\${match}`)
}
