export function json(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')

  return withAppHeaders(new Response(JSON.stringify(body), { ...init, headers }))
}

export function withAppHeaders(response: Response) {
  const appResponse = new Response(response.body, response)

  appResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')

  return appResponse
}
