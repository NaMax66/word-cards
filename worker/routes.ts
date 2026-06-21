import { createSessionToken, expiredSessionCookies, getAppSessionHash, getAppSessionMaxAge, getRequestUser, hashSessionToken, sessionCookies, verifyLoginCredential } from './auth'
import { addPair, createMarker, createSession, deleteMarker, deleteUserAccount, ensureUser, getMarkers, getPair, getPairsCount, getRandomPair, getRandomPairs, getUserData, getWordList, removePair, reorderMarkers, revokeSession, revokeUserSessions, updateMarker, updatePair, updateUserSettings, type PairInput, type PairUpdate } from './db'
import { json } from './responses'

export async function routeApiRequest(request: Request, env: Env) {
  const { pathname } = new URL(request.url)
  const route = `${request.method} ${pathname}`

  try {
    if (route === 'POST /api/login') {
      return login(request, env)
    }

    if (route === 'GET /api/logout') {
      return logout(request, env)
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

    const pairId = readPairId(pathname)

    if (request.method === 'GET' && pairId) {
      const pair = await getPair(env.DB, user.userUid, pairId)

      if (!pair) {
        return json({ status: 'error', error: 'not_found' }, { status: 404 })
      }

      return json({ status: 'success', data: pair })
    }

    if (route === 'GET /api/random-pairs') {
      const { searchParams } = new URL(request.url)
      const count = readNumber(searchParams.get('count'))

      return json({
        status: 'success',
        data: {
          pairs: await getRandomPairs(env.DB, user.userUid, count),
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

    if (route === 'GET /api/markers') {
      return json({ status: 'success', data: await getMarkers(env.DB, user.userUid) })
    }

    if (route === 'POST /api/markers') {
      const body = await readForm(request)
      const uid = crypto.randomUUID()

      await createMarker(
        env.DB,
        user.userUid,
        uid,
        requireString(body.get('code'), 'code'),
        body.get('description')
      )

      return json({ status: 'success', data: { uid } })
    }

    const markerId = readMarkerId(pathname)

    if (request.method === 'PATCH' && markerId) {
      const body = await readForm(request)
      const updated = await updateMarker(
        env.DB,
        user.userUid,
        markerId,
        requireString(body.get('code'), 'code'),
        body.get('description')
      )

      return updated
        ? json({ status: 'success' })
        : json({ status: 'error', error: 'not_found' }, { status: 404 })
    }

    if (request.method === 'DELETE' && markerId) {
      const result = await deleteMarker(env.DB, user.userUid, markerId)

      if (result === 'in_use') {
        return json({ status: 'error', error: 'marker_in_use' }, { status: 409 })
      }
      if (result === 'minimum') {
        return json({ status: 'error', error: 'minimum_markers' }, { status: 409 })
      }
      if (result === 'not_found') {
        return json({ status: 'error', error: 'not_found' }, { status: 404 })
      }

      return json({ status: 'success' })
    }

    if (route === 'POST /api/markers/reorder') {
      const body = await readForm(request)
      const markerIds = requireString(body.get('marker_ids'), 'marker_ids').split(',')

      await reorderMarkers(env.DB, user.userUid, markerIds)

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

    if (route === 'DELETE /api/account') {
      await revokeUserSessions(env.DB, user.userUid, nowInSeconds())
      await deleteUserAccount(env.DB, user.userUid)

      return logout(request, env)
    }

    return json({ status: 'error', error: 'not_found' }, { status: 404 })
  } catch (error) {
    if (error instanceof BadRequestError) {
      return json({ status: 'error', error: 'bad_request', message: error.message }, { status: 400 })
    }
    if (error instanceof Error && [
      'invalid_marker',
      'invalid_marker_order',
      'invalid_marker_code',
      'invalid_marker_description'
    ].includes(error.message)) {
      return json({ status: 'error', error: error.message }, { status: 400 })
    }

    console.error('API request failed', error)

    return json({ status: 'error' }, { status: 500 })
  }
}

async function login(request: Request, env: Env) {
  const body = await readForm(request)
  const provider = body.get('provider') || 'google'
  const credential = requireString(body.get('credential'), 'credential')
  const user = await verifyLoginUser(provider, credential, env)

  if (!user) {
    return json({ status: 'error', error: 'unverified' }, { status: 403 })
  }

  await ensureUser(env.DB, user)

  const headers = new Headers()
  const maxAge = getAppSessionMaxAge()
  const now = nowInSeconds()
  const token = createSessionToken()

  await createSession(
    env.DB,
    await hashSessionToken(token),
    user.userUid,
    now + maxAge,
    now
  )

  for (const value of sessionCookies(token, maxAge)) {
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

async function verifyLoginUser(provider: string, credential: string, env: Env) {
  try {
    return await verifyLoginCredential(provider, credential, env)
  } catch (error) {
    console.error(`${provider} login verification failed`, error)
    return null
  }
}

async function logout(request: Request, env: Env) {
  const sessionHash = await getAppSessionHash(request)

  if (sessionHash) {
    await revokeSession(env.DB, sessionHash, nowInSeconds())
  }

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

async function readPair(request: Request): Promise<PairUpdate> {
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
    markerId: requireString(body.get(`${key}[markerId]`), `${key}.markerId`)
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

function readPairId(pathname: string) {
  const match = /^\/api\/pairs\/([^/]+)$/.exec(pathname)

  if (!match?.[1]) return null

  try {
    return decodeURIComponent(match[1])
  } catch {
    throw new BadRequestError('Invalid pair id')
  }
}

function readMarkerId(pathname: string) {
  const match = /^\/api\/markers\/([^/]+)$/.exec(pathname)

  if (!match?.[1]) return null

  try {
    return decodeURIComponent(match[1])
  } catch {
    throw new BadRequestError('Invalid marker id')
  }
}

class BadRequestError extends Error {}

function nowInSeconds() {
  return Math.floor(Date.now() / 1000)
}
