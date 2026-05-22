function json(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')

  return new Response(JSON.stringify(body), { ...init, headers })
}

export default {
  async fetch(request: Request, _env: Env) {
    const { pathname } = new URL(request.url)

    if (pathname.startsWith('/api/')) {
      return json(
        {
          status: 'error',
          error: 'not_implemented',
          message: 'The Cloudflare API migration has not been wired yet.'
        },
        { status: 501 }
      )
    }

    return new Response('Not found', { status: 404 })
  }
}
