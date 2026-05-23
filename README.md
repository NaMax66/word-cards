# word-cards https://words.selfkit.org

- App for learning new lexical units

## production

- production domain: https://words.selfkit.org
- Cloudflare Worker serves the Vue assets and `/api/*`
- D1 stores user word lists and settings

## local development

- add the local Worker origin to your Google OAuth client: `https://127.0.0.1:8787`
- add the production origin to your Google OAuth client: `https://words.selfkit.org`
- set `APP_GOOGLE_CLIENT_ID=<your-google-client-id>` in ignored local env files

- `npm install` - install dependencies
- `npm run db:migrate:local` - apply D1 migrations locally
- `npm run cf:dev` - starts the local Cloudflare Worker over HTTPS
- `npm run build` - type-checks and builds the app
- `npm run cf:deploy` - deploys the Worker and static assets

todo
-----
- add check internet (Promise.any)
- create native app with a widget(need react native)
- add the nav pane on the mobile's bottom
- add drag and drop for modals
- add form validation(no empty)
