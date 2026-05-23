import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose'

const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))
const googleIssuers = ['accounts.google.com', 'https://accounts.google.com']
const sessionCookieName = 'session-token'
const signedInCookieName = 'signed-in'
const defaultProviderId = 'google'

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
  getCredentialMaxAge(credential: string): number
}

type AuthSession = {
  providerId: string
  credential: string
}

const googleProvider: AuthProvider = {
  id: defaultProviderId,
  verifyCredential: verifyGoogleCredential,
  getCredentialMaxAge: getJwtMaxAge
}

const providers = new Map<string, AuthProvider>([
  [googleProvider.id, googleProvider]
])

export async function getRequestUser(request: Request, env: Env) {
  const session = readSession(request)

  if (!session) {
    return null
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

export function getLoginMaxAge(providerId: string, credential: string) {
  const provider = providers.get(providerId)

  if (!provider) {
    throw new Error(`Unknown auth provider: ${providerId}`)
  }

  return provider.getCredentialMaxAge(credential)
}

export async function verifyGoogleCredential(credential: string, env: Env): Promise<AuthUser> {
  const { payload } = await jwtVerify(credential, googleKeys, {
    audience: env.APP_GOOGLE_CLIENT_ID,
    issuer: googleIssuers
  })

  return toGoogleUser(payload)
}

export function sessionCookies(session: AuthSession, maxAge: number) {
  return [
    cookie(sessionCookieName, serializeSession(session), `Max-Age=${maxAge}; HttpOnly`),
    cookie(signedInCookieName, 'true', `Max-Age=${maxAge}`)
  ]
}

export function expiredSessionCookies() {
  return [
    cookie(sessionCookieName, '', 'Max-Age=0; HttpOnly'),
    cookie(signedInCookieName, '', 'Max-Age=0')
  ]
}

function readSession(request: Request): AuthSession | null {
  const credential = getCookie(request.headers.get('Cookie'), sessionCookieName)

  if (!credential) {
    return null
  }

  return parseSession(credential)
}

function serializeSession({ providerId, credential }: AuthSession) {
  return `${providerId}:${credential}`
}

function parseSession(value: string): AuthSession {
  const separator = value.indexOf(':')

  if (separator === -1) {
    return {
      providerId: defaultProviderId,
      credential: value
    }
  }

  return {
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

function getJwtMaxAge(credential: string) {
  const payload = credential.split('.')[1]

  if (!payload) {
    throw new Error('Invalid credential')
  }

  const jsonPayload = JSON.parse(decodeBase64Url(payload)) as { exp?: unknown }

  if (typeof jsonPayload.exp !== 'number') {
    throw new Error('Credential has no expiry')
  }

  return Math.max(0, jsonPayload.exp - Math.floor(Date.now() / 1000))
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - base64.length % 4) % 4)

  return atob(base64 + padding)
}
