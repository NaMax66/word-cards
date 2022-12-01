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

function updatePair(pair) {
  const sql = 'UPDATE pairs SET origin = ?, translation = ? WHERE pair_uid = ?'
  db.run(sql, [pair.origin.value, pair.translation.value, pair.uid], errFn)
}

export function removePair(pair_uid) {
  db.run('DELETE FROM pairs WHERE pair_uid = ?', [pair_uid], errFn)
}

export function getAllPairsByUserId(user_uid) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * from pairs WHERE user_uid = ?', [user_uid] , (err, rows) => {
      if(err) reject(new Error(err.message))
      resolve(rows)
    })
  })
}

function errFn (err) {
  if (err) {
    console.log(err)
  }
}

export default {
  '103520297794318931805': [
    {
      ru: 'Яблоко',
      en: 'Apple'
    },
    {
      ru: 'Страховка',
      en: 'Insurance'
    },
    {
      ru: 'Космос',
      en: 'Space'
    }
  ]
}