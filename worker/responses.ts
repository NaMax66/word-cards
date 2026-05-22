export function json(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')

  return new Response(JSON.stringify(body), { ...init, headers })
}
