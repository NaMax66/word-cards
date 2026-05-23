# word-cards https://words.selfkit.org

- App for learning new lexical units

## production

- production domain: https://words.selfkit.org
- Cloudflare Worker serves the Vue assets and `/api/*`
- production D1 binding: `word-cards-prod`
- Cloudflare build command: `npm run build`
- Cloudflare deploy command: `npm run cf:deploy`

## local development

- add the local Worker origin to your Google OAuth client: `https://127.0.0.1:8787`
- add the production origin to your Google OAuth client: `https://words.selfkit.org`
- set `APP_GOOGLE_CLIENT_ID=<your-google-client-id>` in ignored local env files
- local dev uses the `dev` Wrangler environment and `word-cards-dev`

- `npm install` - install dependencies
- `npm run db:migrate:local` - apply D1 migrations locally
- `npm run db:migrate:prod` - apply D1 migrations to production
- `npm run dev` - starts the local Cloudflare Worker over HTTPS
- `npm run dev:vite` - starts Vite only, without Worker API or D1
- `npm run build` - type-checks and builds the app
- `npm run cf:deploy` - deploys the Worker and static assets

## product notes

- In the words list, new words should appear visually at the bottom near the fixed add form. The API loads pages newest-first for efficient cursor pagination, then the store reverses each page into oldest-first. The UI intentionally renders the list with `column-reverse`, matching the original behavior where adding a word with `push` immediately shows it next to the add controls.
- Older pages should be prepended to the store list and loaded from the top of the UI, away from the add form.

todo
-----
- add check internet (Promise.any)
- create native app with a widget(need react native)
- add the nav pane on the mobile's bottom
- add drag and drop for modals
- add form validation(no empty)
