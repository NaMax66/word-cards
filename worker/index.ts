import { routeApiRequest } from './routes'
import { json } from './responses'

export default {
  async fetch(request: Request, env: Env) {
    const { pathname } = new URL(request.url)

    if (pathname.startsWith('/api/')) {
      return routeApiRequest(request, env)
    }

    return new Response('Not found', { status: 404 })
  }
}
