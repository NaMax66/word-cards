import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))
const googleIssuers = ['accounts.google.com', 'https://accounts.google.com']

export type GoogleUser = {
  userUid: string
  name: string | null
  givenName: string | null
  email: string | null
  picture: string | null
}

export async function getRequestUser(request: Request, env: Env) {
  const credential = getCookie(request.headers.get('Cookie'), 'session-token')

  if (!credential) {
    return null
  }

  try {
    return await verifyGoogleCredential(credential, env)
  } catch (error) {
    console.error('Google session verification failed', error)
    return null
  }
}

export async function verifyGoogleCredential(credential: string, env: Env) {
  const { payload } = await jwtVerify(credential, googleKeys, {
    audience: env.APP_GOOGLE_CLIENT_ID,
    issuer: googleIssuers
  })

  return toGoogleUser(payload)
}

export function sessionCookies(credential: string, maxAge: number) {
  return [
    cookie('session-token', credential, `Max-Age=${maxAge}; HttpOnly`),
    cookie('signed-in', 'true', `Max-Age=${maxAge}`)
  ]
}

export function expiredSessionCookies() {
  return [
    cookie('session-token', '', 'Max-Age=0; HttpOnly'),
    cookie('signed-in', '', 'Max-Age=0')
  ]
}

function toGoogleUser(payload: JWTPayload): GoogleUser {
  if (typeof payload.sub !== 'string') {
    throw new Error('Google token does not include a subject')
  }

  return {
    userUid: payload.sub,
    name: optionalString(payload.name),
    givenName: optionalString(payload.given_name),
    email: optionalString(payload.email),
    picture: optionalString(payload.picture)
  }
}

function optionalString(value: unknown) {
  return typeof value === 'string' ? value : null
}

function getCookie(header: string | null, name: string) {
  if (!header) {
    return null
  }

  for (const entry of header.split(';')) {
    const [key, ...value] = entry.trim().split('=')

    if (key === name) {
      return decodeURIComponent(value.join('='))
    }
  }

  return null
}

function cookie(name: string, value: string, lifetime: string) {
  return `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Secure; ${lifetime}`
}
