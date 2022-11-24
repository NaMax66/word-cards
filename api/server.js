import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(process.env.APP_GOOGLE_CLIENT_ID)

const app = express()

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(async (req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['http://localhost:5173'])
  res.append('Access-Control-Allow-Methods', 'GET,POST')
  res.append('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.post('/login', async (req, res) => {
  try {
    const { credential } = req.body

    const userData = await verifyUser(credential)
    res.append('Access-Control-Allow-Credentials', true)
    res.cookie('session-token', credential, { domain: 'localhost' })
    res.send({ status: 'success', userData })
  } catch (e) {
    console.error(e)
    res.send('error')
  }
})
/*
app.get('/word-list', (req, res) => {

})*/

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

// middleware function
async function checkAuth(req, res, next) {
  res.append('Access-Control-Allow-Credentials', true)
  const credential = req.cookies['session-token']
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.APP_GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    req.user = {
      name: payload.name,
      picture: payload.picture
    }
    next()
  } catch (e) {
    console.error('checkAuth: ' + e.message)
    res.status(403)
    res.send({ status: 'error', error: 'unverified' })
  }
}

async function verifyUser(credential) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.APP_GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()

    return {
      name: payload.name,
      picture: payload.picture
    }
  } catch (e) {
    console.error('verifyUser: ' + e.message)
  }
}
