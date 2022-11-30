import { OAuth2Client } from 'google-auth-library'
const client = new OAuth2Client(process.env.APP_GOOGLE_CLIENT_ID)
import { getUser, addUser } from './db.mjs'

// middleware function
export async function checkAuth(req, res, next) {
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
    req.userId = payload.sub
    next()
  } catch (e) {
    console.error('checkAuth: ' + e.message)
    res.status(403)
    res.send({ status: 'error', error: 'unverified' })
  }
}

export async function verifyUser(credential) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.APP_GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()

    const user = await getUser(payload.sub)

    if (!user) {
      await addUser(
        {
          user_uid: payload.sub,
          name: payload.name,
          given_name: payload.given_name,
          email: payload.email,
          picture: payload.picture
        }
      )
    }

    return {
      name: payload.name,
      picture: payload.picture
    }
  } catch (e) {
    console.error('verifyUser: ' + e.message)
  }
}
