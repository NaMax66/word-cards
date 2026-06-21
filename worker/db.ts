export type PairInput = {
  origin: WordValueInput
  translation: WordValueInput
}

export type Pair = {
  id: string
  origin: WordValue
  translation: WordValue
}

export type PairUpdate = PairInput & {
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

export type SessionUser = {
  userUid: string
  name: string | null
  givenName: string | null
  email: string | null
  picture: string | null
}

type WordValueInput = {
  value: string
  markerId: string
}

type WordValue = WordValueInput & {
  lang: string
}

type PairRow = {
  id: number
  pair_uid: string
  origin: string
  origin_lang: string
  origin_marker_uid: string
  origin_marker_title: string
  translation: string
  translation_lang: string
  translation_marker_uid: string
  translation_marker_title: string
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

export type Marker = {
  id: string
  code: string
  description: string | null
  sortOrder: number
  usageCount: number
}

const initialMarkers = [
  { code: 'en', description: 'English' },
  { code: 'ru', description: 'Русский' },
  { code: 'fr', description: 'Français' },
  { code: 'es', description: 'Español' },
  { code: 'zh', description: '中文' },
  { code: 'ar', description: 'العربية' }
]
const markerCodeMaxLength = 4
const markerDescriptionMaxLength = 100

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

export async function createSession(
  db: D1Database,
  sessionHash: string,
  userUid: string,
  expiresAt: number,
  now: number
) {
  await db.prepare(
    `INSERT INTO sessions (session_hash, user_uid, expires_at, created_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(sessionHash, userUid, expiresAt, now, now).run()
}

export async function getSessionUser(db: D1Database, sessionHash: string, now: number): Promise<SessionUser | null> {
  const user = await db.prepare(
    `SELECT
       users.user_uid,
       users.name,
       users.given_name,
       users.email,
       users.picture
     FROM sessions
     JOIN users ON users.user_uid = sessions.user_uid
     WHERE sessions.session_hash = ?
       AND sessions.revoked_at IS NULL
       AND sessions.expires_at > ?
     LIMIT 1`
  ).bind(sessionHash, now).first<{
    user_uid: string
    name: string | null
    given_name: string | null
    email: string | null
    picture: string | null
  }>()

  if (!user) return null

  await db.prepare(
    'UPDATE sessions SET last_seen_at = ? WHERE session_hash = ? AND last_seen_at < ?'
  ).bind(now, sessionHash, now - sessionTouchIntervalSeconds).run()

  return {
    userUid: user.user_uid,
    name: user.name,
    givenName: user.given_name,
    email: user.email,
    picture: user.picture
  }
}

export async function revokeSession(db: D1Database, sessionHash: string, now: number) {
  await db.prepare(
    `UPDATE sessions
     SET revoked_at = ?
     WHERE session_hash = ? AND revoked_at IS NULL`
  ).bind(now, sessionHash).run()
}

export async function revokeUserSessions(db: D1Database, userUid: string, now: number) {
  await db.prepare(
    `UPDATE sessions
     SET revoked_at = ?
     WHERE user_uid = ? AND revoked_at IS NULL`
  ).bind(now, userUid).run()
}

export async function getWordList(db: D1Database, userUid: string, params: WordListParams = {}): Promise<WordListPage> {
  await ensureUserMarkers(db, userUid)
  const limit = clampLimit(params.limit)
  const search = normalizeSearch(params.search)
  const rawSearch = params.search?.trim()
  const cursor = normalizeCursor(params.cursor)
  const bindings: Array<string | number> = [userUid]
  const where = ['pairs.user_uid = ?']

  if (cursor) {
    where.push('pairs.id < ?')
    bindings.push(cursor)
  }

  if (search) {
    where.push(`(
      pairs.origin_search LIKE ? ESCAPE '\\'
      OR pairs.translation_search LIKE ? ESCAPE '\\'
      OR pairs.origin LIKE ? ESCAPE '\\'
      OR pairs.translation LIKE ? ESCAPE '\\'
    )`)
    const pattern = `%${escapeLike(search)}%`
    const rawPattern = `%${escapeLike(rawSearch || search)}%`
    bindings.push(pattern, pattern, rawPattern, rawPattern)
  }

  bindings.push(limit + 1)

  const { results } = await db.prepare(
    `${pairSelect}
     FROM pairs
     JOIN user_markers origin_marker
       ON origin_marker.marker_uid = pairs.origin_marker_uid
     JOIN user_markers translation_marker
       ON translation_marker.marker_uid = pairs.translation_marker_uid
     WHERE ${where.join(' AND ')}
     ORDER BY pairs.id DESC
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
  await ensureUserMarkers(db, userUid)
  const bindings: string[] = [userUid]
  const where = ['pairs.user_uid = ?']

  if (excludedPairUid) {
    where.push('pairs.pair_uid != ?')
    bindings.push(excludedPairUid)
  }

  const row = await db.prepare(
    `${pairSelect}
     FROM pairs
     JOIN user_markers origin_marker
       ON origin_marker.marker_uid = pairs.origin_marker_uid
     JOIN user_markers translation_marker
       ON translation_marker.marker_uid = pairs.translation_marker_uid
     WHERE ${where.join(' AND ')}
     ORDER BY RANDOM()
     LIMIT 1`
  ).bind(...bindings).first<PairRow>()

  return row ? toPair(row) : null
}

export async function getPair(db: D1Database, userUid: string, pairUid: string) {
  await ensureUserMarkers(db, userUid)
  const row = await db.prepare(
    `${pairSelect}
     FROM pairs
     JOIN user_markers origin_marker
       ON origin_marker.marker_uid = pairs.origin_marker_uid
     JOIN user_markers translation_marker
       ON translation_marker.marker_uid = pairs.translation_marker_uid
     WHERE pairs.user_uid = ? AND pairs.pair_uid = ?
     LIMIT 1`
  ).bind(userUid, pairUid).first<PairRow>()

  return row ? toPair(row) : null
}

export async function getRandomPairs(db: D1Database, userUid: string, count?: number) {
  await ensureUserMarkers(db, userUid)
  const { results } = await db.prepare(
    `${pairSelect}
     FROM pairs
     JOIN user_markers origin_marker
       ON origin_marker.marker_uid = pairs.origin_marker_uid
     JOIN user_markers translation_marker
       ON translation_marker.marker_uid = pairs.translation_marker_uid
     WHERE pairs.user_uid = ?
     ORDER BY RANDOM()
     LIMIT ?`
  ).bind(userUid, clampRandomPairsCount(count)).all<PairRow>()

  return results.map(toPair)
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
  const markers = await getOwnedMarkers(db, userUid, [
    pair.origin.markerId,
    pair.translation.markerId
  ])

  await db.prepare(
    `INSERT INTO pairs (
       user_uid,
       pair_uid,
       origin,
       origin_lang,
       origin_marker_uid,
       translation,
       translation_lang,
       translation_marker_uid,
       origin_search,
       translation_search
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    userUid,
    uid,
    pair.origin.value,
    markers.get(pair.origin.markerId),
    pair.origin.markerId,
    pair.translation.value,
    markers.get(pair.translation.markerId),
    pair.translation.markerId,
    toSearchValue(pair.origin.value),
    toSearchValue(pair.translation.value)
  ).run()
}

export async function updatePair(db: D1Database, userUid: string, pair: PairUpdate) {
  const markers = await getOwnedMarkers(db, userUid, [
    pair.origin.markerId,
    pair.translation.markerId
  ])

  const result = await db.prepare(
    `UPDATE pairs
     SET origin = ?,
         origin_lang = ?,
         origin_marker_uid = ?,
         translation = ?,
         translation_lang = ?,
         translation_marker_uid = ?,
         origin_search = ?,
         translation_search = ?
     WHERE user_uid = ? AND pair_uid = ?`
  ).bind(
    pair.origin.value,
    markers.get(pair.origin.markerId),
    pair.origin.markerId,
    pair.translation.value,
    markers.get(pair.translation.markerId),
    pair.translation.markerId,
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

export async function deleteUserAccount(db: D1Database, userUid: string) {
  await db.batch([
    db.prepare('DELETE FROM pairs WHERE user_uid = ?').bind(userUid),
    db.prepare('DELETE FROM user_settings WHERE user_uid = ?').bind(userUid),
    db.prepare('DELETE FROM user_markers WHERE user_uid = ?').bind(userUid),
    db.prepare('DELETE FROM users WHERE user_uid = ?').bind(userUid)
  ])
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

export async function getMarkers(db: D1Database, userUid: string) {
  await ensureUserMarkers(db, userUid)

  const { results } = await db.prepare(
    `SELECT
       marker_uid,
       code,
       description,
       sort_order,
       (
         SELECT COUNT(*)
         FROM pairs
         WHERE pairs.user_uid = user_markers.user_uid
           AND (
             pairs.origin_marker_uid = user_markers.marker_uid
             OR pairs.translation_marker_uid = user_markers.marker_uid
           )
       ) AS usage_count
     FROM user_markers
     WHERE user_uid = ?
     ORDER BY sort_order, id`
  ).bind(userUid).all<{
    marker_uid: string
    code: string
    description: string | null
    sort_order: number
    usage_count: number
  }>()

  return results.map(row => ({
    id: row.marker_uid,
    code: row.code,
    description: row.description,
    sortOrder: row.sort_order,
    usageCount: row.usage_count
  }))
}

export async function createMarker(
  db: D1Database,
  userUid: string,
  markerUid: string,
  code: string,
  description: string | null
) {
  await ensureUserMarkers(db, userUid)
  const normalizedCode = normalizeMarkerCode(code)
  const normalizedDescription = normalizeMarkerDescription(description)
  const order = await db.prepare(
    'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM user_markers WHERE user_uid = ?'
  ).bind(userUid).first<{ next_order: number }>()

  await db.prepare(
    `INSERT INTO user_markers (marker_uid, user_uid, code, description, sort_order)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(markerUid, userUid, normalizedCode, normalizedDescription, order?.next_order || 0).run()
}

export async function updateMarker(
  db: D1Database,
  userUid: string,
  markerUid: string,
  code: string,
  description: string | null
) {
  const normalizedCode = normalizeMarkerCode(code)
  const normalizedDescription = normalizeMarkerDescription(description)
  const result = await db.prepare(
    `UPDATE user_markers
     SET code = ?, description = ?
     WHERE user_uid = ? AND marker_uid = ?`
  ).bind(normalizedCode, normalizedDescription, userUid, markerUid).run()

  return result.meta.changes > 0
}

export async function reorderMarkers(db: D1Database, userUid: string, markerIds: string[]) {
  const markers = await getMarkers(db, userUid)

  if (markerIds.length !== markers.length ||
      new Set(markerIds).size !== markerIds.length ||
      markerIds.some(id => !markers.some(marker => marker.id === id))) {
    throw new Error('invalid_marker_order')
  }

  await db.batch(markerIds.map((id, index) => db.prepare(
    'UPDATE user_markers SET sort_order = ? WHERE user_uid = ? AND marker_uid = ?'
  ).bind(index, userUid, id)))
}

export async function deleteMarker(db: D1Database, userUid: string, markerUid: string) {
  const markers = await getMarkers(db, userUid)
  const marker = markers.find(item => item.id === markerUid)

  if (!marker) return 'not_found' as const
  if (markers.length <= 2) return 'minimum' as const
  if (marker.usageCount > 0) return 'in_use' as const

  await db.prepare(
    'DELETE FROM user_markers WHERE user_uid = ? AND marker_uid = ?'
  ).bind(userUid, markerUid).run()

  return 'deleted' as const
}

function toPair(row: PairRow): Pair {
  return {
    id: row.pair_uid,
    origin: {
      value: row.origin,
      markerId: row.origin_marker_uid,
      lang: row.origin_marker_title
    },
    translation: {
      value: row.translation,
      markerId: row.translation_marker_uid,
      lang: row.translation_marker_title
    }
  }
}

async function ensureUserMarkers(db: D1Database, userUid: string) {
  const existing = await db.prepare(
    'SELECT COUNT(*) AS count FROM user_markers WHERE user_uid = ?'
  ).bind(userUid).first<{ count: number }>()

  if (!existing?.count) {
    const { results: legacyRows } = await db.prepare(
      `SELECT lang
       FROM (
         SELECT origin_lang AS lang FROM pairs WHERE user_uid = ?
         UNION
         SELECT translation_lang AS lang FROM pairs WHERE user_uid = ?
       )
       WHERE lang IS NOT NULL AND trim(lang) != ''
       ORDER BY lang`
    ).bind(userUid, userUid).all<{ lang: string }>()

    const markersToCreate = legacyRows.length
      ? legacyRows.map(row => ({ code: row.lang, description: null }))
      : initialMarkers

    await db.batch(markersToCreate.map((marker, index) => db.prepare(
      `INSERT OR IGNORE INTO user_markers (marker_uid, user_uid, code, description, sort_order)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(
      stableMarkerId(userUid, marker.code),
      userUid,
      marker.code,
      marker.description,
      index
    )))
  }

  const { results: markers } = await db.prepare(
    'SELECT marker_uid, code FROM user_markers WHERE user_uid = ?'
  ).bind(userUid).all<{ marker_uid: string, code: string }>()

  if (markers.length < 2) {
    const fallbackMarkers = initialMarkers
      .filter(fallback => !markers.some(marker => marker.code === fallback.code))
      .slice(0, 2 - markers.length)

    await db.batch(fallbackMarkers.map((marker, index) => db.prepare(
      `INSERT OR IGNORE INTO user_markers (marker_uid, user_uid, code, description, sort_order)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(
      stableMarkerId(userUid, marker.code),
      userUid,
      marker.code,
      marker.description,
      markers.length + index
    )))

    markers.push(...fallbackMarkers.map(marker => ({
      marker_uid: stableMarkerId(userUid, marker.code),
      code: marker.code
    })))
  }

  const markerByCode = new Map(markers.map(marker => [marker.code, marker.marker_uid]))

  const { results: missingRows } = await db.prepare(
    `SELECT origin_lang, translation_lang
     FROM pairs
     WHERE user_uid = ?
       AND (origin_marker_uid IS NULL OR translation_marker_uid IS NULL)`
  ).bind(userUid).all<{ origin_lang: string, translation_lang: string }>()

  const missingCodes = [...new Set(missingRows.flatMap(row => [
    row.origin_lang,
    row.translation_lang
  ]).filter(code => code && !markerByCode.has(code)))]

  if (missingCodes.length) {
    const startOrder = markers.length
    await db.batch(missingCodes.map((code, index) => db.prepare(
      `INSERT OR IGNORE INTO user_markers (marker_uid, user_uid, code, sort_order)
       VALUES (?, ?, ?, ?)`
    ).bind(stableMarkerId(userUid, code), userUid, code, startOrder + index)))

    for (const code of missingCodes) {
      markerByCode.set(code, stableMarkerId(userUid, code))
    }
  }

  const updates: D1PreparedStatement[] = []

  for (const [code, markerUid] of markerByCode) {
    updates.push(
      db.prepare(
        `UPDATE pairs
         SET origin_marker_uid = ?
         WHERE user_uid = ? AND origin_marker_uid IS NULL AND origin_lang = ?`
      ).bind(markerUid, userUid, code),
      db.prepare(
        `UPDATE pairs
         SET translation_marker_uid = ?
         WHERE user_uid = ? AND translation_marker_uid IS NULL AND translation_lang = ?`
      ).bind(markerUid, userUid, code)
    )
  }

  if (updates.length) await db.batch(updates)
}

async function getOwnedMarkers(db: D1Database, userUid: string, markerIds: string[]) {
  await ensureUserMarkers(db, userUid)
  const uniqueIds = [...new Set(markerIds)]
  const placeholders = uniqueIds.map(() => '?').join(', ')
  const { results } = await db.prepare(
    `SELECT marker_uid, code
     FROM user_markers
     WHERE user_uid = ? AND marker_uid IN (${placeholders})`
  ).bind(userUid, ...uniqueIds).all<{ marker_uid: string, code: string }>()

  if (results.length !== uniqueIds.length) {
    throw new Error('invalid_marker')
  }

  return new Map(results.map(marker => [marker.marker_uid, marker.code]))
}

function normalizeMarkerCode(code: string) {
  const value = code.trim()

  if (!value || value.length > markerCodeMaxLength) {
    throw new Error('invalid_marker_code')
  }

  return value
}

function normalizeMarkerDescription(description: string | null) {
  const value = description?.trim() || null

  if (value && value.length > markerDescriptionMaxLength) {
    throw new Error('invalid_marker_description')
  }

  return value
}

function stableMarkerId(userUid: string, code: string) {
  const source = `${userUid}:${code}`
  let hash = 2166136261

  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return `marker-${(hash >>> 0).toString(36)}`
}

const pairSelect = `SELECT
  pairs.id,
  pairs.pair_uid,
  pairs.origin,
  pairs.origin_lang,
  pairs.origin_marker_uid,
  origin_marker.code AS origin_marker_title,
  pairs.translation,
  pairs.translation_lang,
  pairs.translation_marker_uid,
  translation_marker.code AS translation_marker_title`

function clampLimit(limit: number | undefined) {
  if (!limit || Number.isNaN(limit)) return 50

  return Math.min(Math.max(Math.floor(limit), 1), 100)
}

function clampRandomPairsCount(count: number | undefined) {
  if (!count || Number.isNaN(count)) return 1

  return Math.min(Math.max(Math.floor(count), 1), 100)
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

const sessionTouchIntervalSeconds = 60 * 60 * 24
