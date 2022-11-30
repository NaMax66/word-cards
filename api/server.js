import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { checkAuth, verifyUser } from './verify.mjs'
import db from './mock.mjs'


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
    res.append('Access-Control-Allow-Credentials', true)
    res.cookie('session-token', credential)
    res.send({ status: 'success', userData })
  } catch (e) {
    console.error(e)
    res.send('error')
  }
})
app.get('/word-list', checkAuth, (req, res) => {
  console.log(req.userId)
  res.send({ status: 'success', data: db[req.userId] })
})

app.get('/user-data', checkAuth, async (req, res) => {
  res.send({ status: 'success', data: req.user })
})

app.get('/logout', (req, res) => {
  res.append('Access-Control-Allow-Credentials', true)
  res.clearCookie('session-token')
  res.send('success')
})

const port = process.env.APP_PORT

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
