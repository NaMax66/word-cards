import vue from '@vitejs/plugin-vue'
import { execSync } from 'node:child_process'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

const ENV_PREFIX = 'APP_'

function readGitValue(command: string) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return ''
  }
}

const commitSha = (process.env.CF_PAGES_COMMIT_SHA || readGitValue('git rev-parse HEAD')).slice(0, 8)
const appVersion = commitSha || 'dev'

export default () => {
  return defineConfig({
    plugins: [vue()],
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
      __APP_REPO_URL__: JSON.stringify('https://github.com/NaMax66/word-cards')
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
      }
    },
    preview: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
      }
    },
    envPrefix: ENV_PREFIX,
  })
}
