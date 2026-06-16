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

## marker management specification

### Purpose

The values currently called languages on the two sides of a card should become
user-managed markers. A marker may represent a language, but it may also
represent any other card-side role.

Examples:

- `Русский` -> `English`
- `Вопрос` -> `Ответ`
- `Термин` -> `Определение`
- `Страна` -> `Столица`

Each side of every card must have a marker. Markers are not optional.

### Initial markers

There is no global language directory in the database. The application keeps
the initial marker template in code and copies it into a user's personal marker
list when that list is empty.

The initial template contains short codes and descriptions for the six official
UN languages:

- `en` - English
- `ru` - Русский
- `fr` - Français
- `es` - Español
- `zh` - 中文
- `ar` - العربية

These markers are only defaults. After creation they are ordinary personal
markers and may be renamed or deleted.

The backend must create the initial markers transactionally and idempotently to
avoid duplicates when several first requests are made concurrently.

### Minimum marker count

A user must always have at least two markers.

- If a user has no markers, the backend creates the initial template.
- The UI and API must reject deletion when it would leave fewer than two
  markers.
- Because reaching zero markers is forbidden after initialization, an empty
  marker list can safely mean that the user has not been initialized yet.
- A separate `markers_initialized` flag is not required while this invariant is
  enforced.

### Data model

Markers belong to a user and do not reference a global language table.

Proposed table:

```sql
CREATE TABLE user_markers (
  id INTEGER PRIMARY KEY,
  marker_uid TEXT NOT NULL UNIQUE,
  user_uid TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_uid) REFERENCES users(user_uid) ON DELETE CASCADE
);

CREATE INDEX idx_user_markers_user_uid
  ON user_markers(user_uid, sort_order);
```

The marker code is required, trimmed, and limited to four characters. The
description is optional and limited to 100 characters. Cards reference the
stable marker identifier, so changing either field does not rewrite cards.

The intended card-side shape is:

```ts
type CardSide = {
  value: string
  markerId: string
}
```

### Marker operations

The marker settings screen must allow the user to:

- view markers in their display order;
- see whether each marker is used and how many card sides reference it;
- add a marker with a required code and optional description;
- edit a marker code and description;
- change marker order;
- delete a marker when the minimum-count and usage rules allow it.

Each marker row should display a usage indicator, for example `24 cards` or
`Not used`. This information must be visible before the user attempts deletion,
not only in an error message.

Marker codes and descriptions are trimmed. Empty codes and codes longer than
four characters must be rejected by both the UI and API.

### Deleting a used marker

A marker referenced by cards must not be silently deleted. The first
implementation may reject deletion and show how many cards use the marker.

A later version may support replacing the marker in all affected cards before
deletion. The replacement must belong to the same user and the update and
deletion must be performed atomically.

### API requirements

The backend remains the authority for marker ownership and invariants. Required
operations:

- list the current user's markers;
- create a marker;
- update a marker code and description;
- reorder markers;
- delete an unused marker;
- return marker usage count or a conflict response when deletion is blocked.

The API must verify that every marker assigned to a card belongs to the same
authenticated user. Client-provided marker codes or descriptions are not stored
on cards.

### UI changes

- Replace the hardcoded card-language list with the authenticated user's
  markers.
- Keep a marker dropdown for each card side.
- Show only the short marker code in card dropdowns and on cards.
- Add a separate marker-management screen accessible from settings.
- Show a usage badge or counter next to every marker on that screen.
- Visually distinguish unused markers from markers that cannot currently be
  deleted because they are referenced by cards.
- Use the first two markers as defaults for new cards.
- Use language terminology in the UI (`Languages`, `Language code`, and
  `Language name`). Marker remains an internal implementation term.
- Interface localization remains separate and continues to use the supported
  `vue-i18n` locales.

### Existing data migration

Existing cards currently store free-form values in `origin_lang` and
`translation_lang`. Migration must:

1. Collect distinct language values for each user.
2. Create one personal marker for each distinct value.
3. Add marker-reference columns to `pairs`.
4. Map each existing card side to the corresponding personal marker.
5. Verify that every card side has a valid marker.
6. Remove the legacy language columns only after the application no longer
   reads them.

The migration must preserve custom existing values such as `sr`, `it`, `kz`,
and `fr`; they must not be limited to the new initial template.

### Acceptance criteria

- A new user automatically receives the six initial markers once.
- A user can add arbitrary short markers such as `q` and `a`, with optional
  descriptions `Вопрос` and `Ответ`.
- Initial markers can be renamed and deleted like any other marker.
- A user can never have fewer than two markers.
- Every card side references a marker owned by that card's user.
- Changing a marker code changes its displayed value on all related cards.
- The marker-management screen shows the current usage count for every marker.
- Deleting a used marker is blocked until its cards are reassigned.
- No complete list of world languages is stored or maintained on the backend.
