import express from 'express'
import bodyParser from 'body-parser'
import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(process.env.APP_GOOGLE_CLIENT_ID)

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['http://localhost:5173'])
  res.append('Access-Control-Allow-Methods', 'GET,POST')
  res.append('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/login', async (req, res) => {
  try {
    const { credential } = req.body

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.APP_GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    const userid = payload['sub']
    console.log(userid)
    res.append('Access-Control-Allow-Credentials', true)
    res.cookie('session-token', credential, { domain: 'localhost' })
    res.send('success')
  } catch (e) {
    console.error(e)
    res.send('error')
  }
})

app.get('/word-list', (req, res) => {

})

app.get('/logout', (req, res) => {
  res.clearCookie('session-token')
  res.send('success')
})

const port = process.env.APP_PORT

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
