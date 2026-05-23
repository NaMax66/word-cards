import { expiredSessionCookies, getRequestUser, sessionCookies, verifyGoogleCredential } from './auth'
import { addPair, ensureUser, getPairsCount, getRandomPair, getUserData, getWordList, removePair, updatePair, updateUserSettings, type Pair, type PairInput } from './db'
import { json } from './responses'

export async function routeApiRequest(request: Request, env: Env) {
  const { pathname } = new URL(request.url)
  const route = `${request.method} ${pathname}`

  try {
    if (route === 'POST /api/login') {
      return login(request, env)
    }

    if (route === 'GET /api/logout') {
      return logout()
    }

    const user = await getRequestUser(request, env)

    if (!user) {
      return json({ status: 'error', error: 'unverified' }, { status: 403 })
    }

    if (route === 'GET /api/word-list') {
      const { searchParams } = new URL(request.url)

      return json({
        status: 'success',
        data: await getWordList(env.DB, user.userUid, {
          limit: readNumber(searchParams.get('limit')),
          cursor: searchParams.get('cursor'),
          search: searchParams.get('search')
        })
      })
    }

    if (route === 'GET /api/random-pair') {
      const { searchParams } = new URL(request.url)
      const currentId = searchParams.get('exclude')

      return json({
        status: 'success',
        data: {
          pair: await getRandomPair(env.DB, user.userUid, currentId),
          count: await getPairsCount(env.DB, user.userUid)
        }
      })
    }

    if (route === 'POST /api/add-pair') {
      const pair = await readPairInput(request)
      const uid = crypto.randomUUID()

      await addPair(env.DB, user.userUid, uid, pair)

      return json({ status: 'success', data: { uid } })
    }

    if (route === 'POST /api/update-pair') {
      await updatePair(env.DB, user.userUid, await readPair(request))

      return json({ status: 'success' })
    }

    if (route === 'POST /api/remove-pair') {
      const body = await readForm(request)
      const pairUid = requireString(body.get('pair_uid'), 'pair_uid')

      await removePair(env.DB, user.userUid, pairUid)

      return json({ status: 'success' })
    }

    if (route === 'GET /api/user-data') {
      const data = await getUserData(env.DB, user.userUid)

      return json({ status: 'success', data })
    }

    if (route === 'POST /api/update-user-settings') {
      const body = await readForm(request)
      const settings = requireString(body.get('settings'), 'settings')

      await updateUserSettings(env.DB, user.userUid, settings)

      return json({ status: 'success' })
    }

    return json({ status: 'error', error: 'not_found' }, { status: 404 })
  } catch (error) {
    if (error instanceof BadRequestError) {
      return json({ status: 'error', error: 'bad_request', message: error.message }, { status: 400 })
    }

    console.error('API request failed', error)

    return json({ status: 'error' }, { status: 500 })
  }
}

async function login(request: Request, env: Env) {
  const body = await readForm(request)
  const credential = requireString(body.get('credential'), 'credential')
  const user = await verifyLoginUser(credential, env)

  if (!user) {
    return json({ status: 'error', error: 'unverified' }, { status: 403 })
  }

  await ensureUser(env.DB, user)

  const headers = new Headers()
  const maxAge = getCredentialMaxAge(credential)

  for (const value of sessionCookies(credential, maxAge)) {
    headers.append('Set-Cookie', value)
  }

  return json(
    {
      status: 'success',
      userData: {
        name: user.name,
        picture: user.picture
      }
    },
    { headers }
  )
}

async function verifyLoginUser(credential: string, env: Env) {
  try {
    return await verifyGoogleCredential(credential, env)
  } catch (error) {
    console.error('Google login verification failed', error)
    return null
  }
}

function logout() {
  const headers = new Headers()

  for (const value of expiredSessionCookies()) {
    headers.append('Set-Cookie', value)
  }

  return json({ status: 'success' }, { headers })
}

async function readPairInput(request: Request): Promise<PairInput> {
  const body = await readForm(request)

  return {
    origin: readWordValue(body, 'origin'),
    translation: readWordValue(body, 'translation')
  }
}

async function readPair(request: Request): Promise<Pair> {
  const body = await readForm(request)

  return {
    id: requireString(body.get('id'), 'id'),
    origin: readWordValue(body, 'origin'),
    translation: readWordValue(body, 'translation')
  }
}

async function readForm(request: Request) {
  return new URLSearchParams(await request.text())
}

function readWordValue(body: URLSearchParams, key: string) {
  return {
    value: requireString(body.get(`${key}[value]`), `${key}.value`),
    lang: requireString(body.get(`${key}[lang]`), `${key}.lang`)
  }
}

function requireString(value: string | null, field: string) {
  if (!value) {
    throw new BadRequestError(`Missing ${field}`)
  }

  return value
}

function readNumber(value: string | null) {
  if (!value) return undefined

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : undefined
}

function getCredentialMaxAge(credential: string) {
  const payload = credential.split('.')[1]

  if (!payload) {
    throw new BadRequestError('Invalid credential')
  }

  const jsonPayload = JSON.parse(decodeBase64Url(payload)) as { exp?: unknown }

  if (typeof jsonPayload.exp !== 'number') {
    throw new BadRequestError('Credential has no expiry')
  }

  return Math.max(0, jsonPayload.exp - Math.floor(Date.now() / 1000))
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - base64.length % 4) % 4)

  return atob(base64 + padding)
}

class BadRequestError extends Error {}
