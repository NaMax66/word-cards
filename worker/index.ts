import { routeApiRequest } from './routes'
import { withAppHeaders } from './responses'

export default {
  async fetch(request: Request, env: Env) {
    const { pathname } = new URL(request.url)

    if (pathname.startsWith('/api/')) {
      return routeApiRequest(request, env)
    }

    if (env.ASSETS) {
      return withAppHeaders(await env.ASSETS.fetch(request))
    }

    return withAppHeaders(new Response('Not found', { status: 404 }))
  }
}
