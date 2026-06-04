# word-cards https://words.selfkit.org

- App for learning new lexical units

## production

- production domain: https://words.selfkit.org
- Cloudflare Worker serves the Vue assets and `/api/*`
- production D1 binding: `word-cards-prod`
- Cloudflare build command: `npm run build`
- Cloudflare deploy command: `npm run cf:deploy`

## license

This project is source-available for personal, educational, and evaluation use.
Commercial use requires the author's prior written consent. See `LICENSE`.

## local development

- add the local Worker origin to your Google OAuth client: `https://127.0.0.1:8787`
- for FedCM experiments, prefer `localhost` origins in Google OAuth client, for example `http://localhost:8787` or `https://localhost:8787`
- add the production origin to your Google OAuth client: `https://words.selfkit.org`
- set `APP_GOOGLE_CLIENT_ID=<your-google-client-id>` in ignored local env files
- Google FedCM is enabled by default; set `APP_USE_FEDCM=false` to disable it
  for a build
- local dev uses the `dev` Wrangler environment and `word-cards-dev`

- `npm install` - install dependencies
- `npm run db:migrate:local` - apply D1 migrations locally
- `npm run db:migrate:prod` - apply D1 migrations to production
- `npm run dev` - starts Vite serve for frontend development
- `npm run dev:worker` - starts the local Cloudflare Worker over HTTPS
- `npm run dev:vite` - starts Vite only, without Worker API or D1
- `npm run build` - type-checks and builds the app
- `npm run cf:deploy` - deploys the Worker and static assets

## auth architecture

The auth system is intentionally split into small roles so the same pattern can
be reused on other clients such as Android, browser extensions, or future
frontends.

### Client roles

- `src/services/auth.ts` owns provider clients and the `/api/login` and
  `/api/logout` calls. The current provider is `GoogleAuth`.
- `AuthProviderClient` is the client-side provider contract. A provider exposes
  an `id`, an `init` method, a `renderButton` method, and a `prompt` method.
- `src/components/GoogleAuth.vue` is only UI orchestration. It renders the
  provider button, reacts to credentials, and updates user state.
- `src/services/httpClient.ts` owns API defaults, credentials, form encoding,
  and the `unverified` response handling. It does not import Google auth.
- `src/services/authEvents.ts` is the boundary between generic API failures and
  UI auth. When the API returns `unverified`, it emits an auth-required event;
  the mounted auth UI decides how to prompt.
- `src/services/checkIsSignedIn.ts` reads the non-HttpOnly `signed-in` hint
  cookie. This cookie is only a UI hint, not security authority.

### Worker roles

- `worker/routes.ts` owns HTTP routing and request parsing. `POST /api/login`
  accepts `provider` and `credential`, ensures the user exists, and sets session
  cookies.
- `worker/auth.ts` owns provider verification, session cookie creation,
  session parsing, and user extraction from requests.
- `AuthProvider` is the Worker-side provider contract. A provider verifies a
  credential and returns a normalized `AuthUser`.
- The session cookie stores `provider:credential` as an HttpOnly cookie. Old
  Google-only cookies without the provider prefix are still read as Google
  sessions for compatibility.
- Protected API routes should call `getRequestUser(request, env)` and reject
  unauthenticated requests with `unverified`.

### Porting blueprint

1. Keep the server contract: `POST /api/login` receives `provider` and
   `credential`; protected routes trust only the HttpOnly session cookie.
2. Implement a platform-native provider client that can obtain a provider
   credential. On Android this might be Google Credential Manager; on web it is
   Google Identity Services.
3. Send the credential through the same login API and let the Worker verify it.
   Do not trust client-decoded profile data.
4. Store only UI hints on the client. The real session should remain HttpOnly
   and verified on the Worker for every protected request.
5. To add a provider, add a client provider with a unique `id`, then add a
   matching Worker `AuthProvider` that validates that provider's credential and
   maps it to `AuthUser`.

### Google and COOP/FedCM notes

- The default web flow uses Google Identity Services with `ux_mode: 'popup'`.
- FedCM is enabled by default and can be disabled with `APP_USE_FEDCM=false`.
- If FedCM fails to issue a credential, the client falls back to the classic
  Google popup/button flow.
- Worker and Vite responses send
  `Cross-Origin-Opener-Policy: same-origin-allow-popups` so the Google popup can
  communicate with the app.
- FedCM is worth testing for production, but it can be stricter on local origins.
  Prefer `localhost` OAuth origins when experimenting with FedCM locally; `127.0.0.1`
  can still work better with the classic popup flow.

## product notes

- In the words list, new words should appear visually at the bottom near the fixed add form. The API loads pages newest-first for efficient cursor pagination, then the store reverses each page into oldest-first. The UI intentionally renders the list with `column-reverse`, matching the original behavior where adding a word with `push` immediately shows it next to the add controls.
- Older pages should be prepended to the store list and loaded from the top of the UI, away from the add form.
- Android widget API: `GET /api/random-pairs?count=10` returns a batch of
  random word pairs in one request. It should later support optional date range
  and topic/theme range filters. Notify/update the Android app so it can replace
  repeated single `/api/random-pair` calls with the batch endpoint.
- Product roadmap and business notes are tracked privately outside the public
  README.
- Avoid hostname-specific feature toggles. Use explicit environment flags
  instead, so staging, production, and future custom domains can opt in without
  code changes.
