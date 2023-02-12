import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { checkAuth, verifyUser } from './verify.mjs'
import { getAllPairsByUserId, addPair, removePair, updatePair } from './db.mjs'
import { getWordList } from './DTO/getWordList.js'
import { v4 as getUID } from 'uuid'
import history from 'connect-history-api-fallback'

import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(history())
app.use(express.static(path.join(__dirname, 'dist')))

app.use(async (req, res, next) => {
  res.append('Access-Control-Allow-Origin', [process.env.APP_ORIGIN])
  res.append('Access-Control-Allow-Methods', 'GET,POST')
  res.append('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.post('/api/login', async (req, res) => {
  try {
    const { credential } = req.body

    const userData = await verifyUser(credential)
    res.append('Access-Control-Allow-Credentials', 'true')
    res.cookie('session-token', credential)
    res.send({ status: 'success', userData })
  } catch (e) {
    console.error(e)
    res.send('error')
  }
})

app.get('/api/word-list', checkAuth, async (req, res) => {
  res.send({ status: 'success', data: getWordList(await getAllPairsByUserId(req.userId)) })
})

app.post('/api/add-pair', checkAuth, async (req, res) => {
  try {
    const { origin, translation } = req.body
    const uid = getUID()
    addPair(req.userId, { uid, origin, translation })
    res.send({ status: 'success', data: { uid } })
  } catch (e) {
    console.error(e)
    res.send('error')
  }
})

app.post('/api/remove-pair', checkAuth, async (req, res) => {
  try {
    const { pair_uid } = req.body
    removePair(req.userId, pair_uid)

    res.send({ status: 'success' })
  } catch (e) {
    console.error(e)
    res.send('error')
  }
})

app.post('/api/update-pair', checkAuth, async (req, res) => {
  try {
    const { origin, translation, id } = req.body

    updatePair({ uid: id, origin, translation })
    res.send({ status: 'success' })
  } catch (e) {
    console.error(e)
    res.send('error')
  }
})

app.get('/api/user-data', checkAuth, async (req, res) => {
  res.send({ status: 'success', data: req.user })
})

app.get('/api/logout', (req, res) => {
  res.append('Access-Control-Allow-Credentials', 'true')
  res.clearCookie('session-token')
  res.send('success')
})

const port = process.env.APP_PORT

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
