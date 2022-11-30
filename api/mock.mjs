import core from 'sqlite3'
const sqlite3 = core.verbose()

const db = new sqlite3.Database('./test.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err) console.log(err.message)
})

// db.run('CREATE TABLE users(id INTEGER PRIMARY KEY, user_uid, first_name, last_name, email)')
// db.run('DROP TABLE users')
// const sql = 'INSERT INTO users(user_uid, first_name, last_name, email) VALUES (?, ?, ?, ?)'

/*db.run(sql, [456, 'Max', 'N', 'f@f.f'], (err) => {
  if(err) console.log(err.message)
})*/

// const sql = 'SELECT * from users'

/*db.all(sql, [], (err, rows) => {
  if(err) return console.log(err.message)
  rows.forEach((row) => {
    console.log(row)
  })
})*/

/*const sql = 'UPDATE users SET first_name = ? WHERE id = ?'
db.run(sql, ['Max N', 1], (err) => {
  if (err) {
    console.log(err)
  }
})*/

/*const sql = 'DELETE FROM users WHERE id = ?'
db.run(sql, [1], (err) => {
  if (err) {
    console.log(err)
  }
})*/

// { origin: { lang: 'ru', value: 'Яблоко' }, translation: { lang: 'en', value: 'Apple' } }
export function addPair(user_uid, pair) {
  const sql = 'INSERT INTO pairs(user_uid, origin, origin_lang, translation, translation_lang) VALUES (?, ?, ?, ?, ?)'

  db.run(sql, [user_uid, pair.origin.value, pair.origin.lang, pair.translation.value, pair.translation.lang], (err) => {
    if(err) console.log(err.message)
  })
}

export function getAllPairsByUserId(user_uid) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * from pairs WHERE user_uid = ?', [user_uid] , (err, rows) => {
      if(err) reject(new Error(err.message))
      resolve(rows)
    })
  })
}

getAllPairsByUserId('123').then((data) => {
  console.log(data)
})

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
