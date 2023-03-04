import core from 'sqlite3'
const sqlite3 = core.verbose()

const db = new sqlite3.Database(`./${process.env.APP_DB_NAME}.db`, sqlite3.OPEN_READWRITE, (err) => {
  if(err) console.log(err.message)
})

export function addUser({ user_uid, name, given_name, email, picture}) {
  const sql = 'INSERT INTO users(user_uid, name, given_name, email, picture) VALUES (?, ?, ?, ?, ?)'
  db.run(sql, [user_uid, name, given_name, email, picture], errFn)
}

export function getUser(user_uid) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE user_uid = ?'

    db.get(sql, [user_uid], (err, row) => {
      if (err) reject(new Error(err.message))
      resolve(row)
    })
  })
}

// { uid: '555', origin: { lang: 'ru', value: 'Яблоко' }, translation: { lang: 'en', value: 'Apple' } }
export function addPair(user_uid, { uid, origin, translation}) {
  const sql = 'INSERT INTO pairs(user_uid, pair_uid, origin, origin_lang, translation, translation_lang) VALUES (?, ?, ?, ?, ?, ?)'

  db.run(sql, [user_uid, uid, origin.value, origin.lang, translation.value, translation.lang], errFn)
}

export function updatePair({ uid, origin, translation }) {
  const sql = 'UPDATE pairs SET origin = ?, origin_lang = ?, translation = ?, translation_lang = ? WHERE pair_uid = ?'
  db.run(sql, [origin.value, origin.lang, translation.value, translation.lang, uid], errFn)
}

export function removePair(user_uid, pair_uid) {
  db.run('DELETE FROM pairs WHERE user_uid = ? AND pair_uid = ?', [user_uid, pair_uid], errFn)
}

export function getAllPairsByUserId(user_uid) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * from pairs WHERE user_uid = ?', [user_uid] , (err, rows) => {
      if(err) reject(new Error(err.message))
      resolve(rows)
    })
  })
}

export function addUserSettings(user_uid, settings_jwt) {
  const SQL = 'INSERT INTO user_settings(user_uid, settings_jwt) VALUES (?, ?)'
  db.run(SQL, [user_uid, settings_jwt], errFn)
}

export function updateUserSettings(user_uid, settings_jwt) {
  const SQL = 'UPDATE user_settings SET settings_jwt = ? WHERE user_uid = ?'
  db.run(SQL, [settings_jwt, user_uid], errFn)
}

export function getUserSettings(user_uid) {
  const SQL = 'SELECT settings_jwt from user_settings WHERE user_uid = ?'
  return new Promise((resolve, reject) => {
    db.run(SQL, [user_uid], (err, settings) => {
      if(err) reject(new Error(err.message))
      resolve(settings)
    })
  })
}

function errFn (err) {
  if (err) {
    console.log(err)
  }
}
