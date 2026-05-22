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

export async function getWordList(db: D1Database, userUid: string) {
  const { results } = await db.prepare(
    `SELECT pair_uid, origin, origin_lang, translation, translation_lang
     FROM pairs
     WHERE user_uid = ?
     ORDER BY id`
  ).bind(userUid).all<PairRow>()

  return results.map(toPair)
}

export async function addPair(db: D1Database, userUid: string, uid: string, pair: PairInput) {
  await db.prepare(
    `INSERT INTO pairs (
       user_uid,
       pair_uid,
       origin,
       origin_lang,
       translation,
       translation_lang
     ) VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(
    userUid,
    uid,
    pair.origin.value,
    pair.origin.lang,
    pair.translation.value,
    pair.translation.lang
  ).run()
}

export async function updatePair(db: D1Database, userUid: string, pair: Pair) {
  const result = await db.prepare(
    `UPDATE pairs
     SET origin = ?,
         origin_lang = ?,
         translation = ?,
         translation_lang = ?
     WHERE user_uid = ? AND pair_uid = ?`
  ).bind(
    pair.origin.value,
    pair.origin.lang,
    pair.translation.value,
    pair.translation.lang,
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
