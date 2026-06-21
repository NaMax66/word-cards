import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'
import { getSessionUser } from './db'

const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))
const googleIssuers = ['accounts.google.com', 'https://accounts.google.com']
const sessionCookieName = 'session-token'
const signedInCookieName = 'signed-in'
const defaultProviderId = 'google'
const appSessionPrefix = 'v2:'
const appSessionMaxAge = 60 * 60 * 24 * 30

export type AuthUser = {
  userUid: string
  name: string | null
  givenName: string | null
  email: string | null
  picture: string | null
}

type AuthProvider = {
  id: string
  verifyCredential(credential: string, env: Env): Promise<AuthUser>
}

type ParsedSession =
  | { type: 'app', token: string }
  | { type: 'legacy', providerId: string, credential: string }

const googleProvider: AuthProvider = {
  id: defaultProviderId,
  verifyCredential: verifyGoogleCredential
}

const providers = new Map<string, AuthProvider>([
  [googleProvider.id, googleProvider]
])

export async function getRequestUser(request: Request, env: Env) {
  const session = readSession(request)

  if (!session) {
    return null
  }

  if (session.type === 'app') {
    try {
      return await getSessionUser(env.DB, await hashSessionToken(session.token), nowInSeconds())
    } catch (error) {
      console.error('App session verification failed', error)
      return null
    }
  }

  const provider = providers.get(session.providerId)

  if (!provider) {
    console.error(`Unknown auth provider: ${session.providerId}`)
    return null
  }

  try {
    return await provider.verifyCredential(session.credential, env)
  } catch (error) {
    console.error(`${provider.id} session verification failed`, error)
    return null
  }
}

export async function verifyLoginCredential(providerId: string, credential: string, env: Env) {
  const provider = providers.get(providerId)

  if (!provider) {
    throw new Error(`Unknown auth provider: ${providerId}`)
  }

  return provider.verifyCredential(credential, env)
}

export function getAppSessionMaxAge() {
  return appSessionMaxAge
}

export function createSessionToken() {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)

  return base64UrlEncode(bytes)
}

export async function hashSessionToken(token: string) {
  const data = new TextEncoder().encode(token)
  const digest = await crypto.subtle.digest('SHA-256', data)

  return base64UrlEncode(new Uint8Array(digest))
}

export async function getAppSessionHash(request: Request) {
  const session = readSession(request)

  if (session?.type !== 'app') return null

  return hashSessionToken(session.token)
}

export async function verifyGoogleCredential(credential: string, env: Env): Promise<AuthUser> {
  const { payload } = await jwtVerify(credential, googleKeys, {
    audience: env.APP_GOOGLE_CLIENT_ID,
    issuer: googleIssuers
  })

  return toGoogleUser(payload)
}

export function sessionCookies(token: string, maxAge: number) {
  return [
    cookie(sessionCookieName, serializeAppSession(token), `Max-Age=${maxAge}; HttpOnly`),
    cookie(signedInCookieName, 'true', `Max-Age=${maxAge}`)
  ]
}

export function expiredSessionCookies() {
  return [
    cookie(sessionCookieName, '', 'Max-Age=0; HttpOnly'),
    cookie(signedInCookieName, '', 'Max-Age=0')
  ]
}

function readSession(request: Request): ParsedSession | null {
  const credential = getCookie(request.headers.get('Cookie'), sessionCookieName)

  if (!credential) {
    return null
  }

  return parseSession(credential)
}

function serializeAppSession(token: string) {
  return `${appSessionPrefix}${token}`
}

function parseSession(value: string): ParsedSession {
  if (value.startsWith(appSessionPrefix)) {
    return {
      type: 'app',
      token: value.slice(appSessionPrefix.length)
    }
  }

  const separator = value.indexOf(':')

  if (separator === -1) {
    return {
      type: 'legacy',
      providerId: defaultProviderId,
      credential: value
    }
  }

  return {
    type: 'legacy',
    providerId: value.slice(0, separator),
    credential: value.slice(separator + 1)
  }
}

function toGoogleUser(payload: JWTPayload): AuthUser {
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

function base64UrlEncode(bytes: Uint8Array) {
  let value = ''

  for (const byte of bytes) {
    value += String.fromCharCode(byte)
  }

  return btoa(value)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function nowInSeconds() {
  return Math.floor(Date.now() / 1000)
}
