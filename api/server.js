import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { checkAuth, verifyUser } from './verify.mjs'
import { getAllPairsByUserId, addPair } from './db.mjs'
import { getWordList } from './DTO/getWordList.js'
import { v4 as getUID } from 'uuid'

const app = express()

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(async (req, res, next) => {
  res.append('Access-Control-Allow-Origin', [process.env.APP_ORIGIN])
  res.append('Access-Control-Allow-Methods', 'GET,POST')
  res.append('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.post('/login', async (req, res) => {
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

app.get('/word-list', checkAuth, async (req, res) => {
  res.send({ status: 'success', data: getWordList(await getAllPairsByUserId(req.userId)) })
})

app.post('/add-pair', checkAuth, async (req, res) => {
  try {
    const { origin, translation } = req.body
    addPair(req.userId, { uid: getUID(), origin, translation })
    res.send({ status: 'success' })
  } catch (e) {
    console.error(e)
    res.send('error')
  }
})

app.get('/user-data', checkAuth, async (req, res) => {
  res.send({ status: 'success', data: req.user })
})

app.get('/logout', (req, res) => {
  res.append('Access-Control-Allow-Credentials', 'true')
  res.clearCookie('session-token')
  res.send('success')
})

const port = process.env.APP_PORT

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
