import httpClient, { postOptions } from '@/services/httpClient'

type AuthCredentialResponse = {
  credential: string
}

type AuthProviderClient = {
  id: string
  init(callback: (response: AuthCredentialResponse) => void): Promise<void>
  renderButton(element: HTMLElement | null): Promise<void>
  prompt(): Promise<void>
}

const googleScriptReady = new Promise<void>((resolve, reject) => {
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = () => resolve()
  script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
  document.body.appendChild(script)
})

export const GoogleAuth: AuthProviderClient = {
  id: 'google',

  init(callback) {
    return googleScriptReady.then(() => {
      google.accounts.id.initialize({
        client_id: import.meta.env.APP_GOOGLE_CLIENT_ID,
        callback,
        ux_mode: 'popup'
      })
    })
  },

  renderButton(element) {
    if (!element) return Promise.resolve()

    return googleScriptReady.then(() => {
      google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        type: 'standard'
      })
    })
  },

  prompt() {
    return googleScriptReady.then(() => {
      google.accounts.id.prompt()
    })
  }
}

export const authApi = {
  login(provider: AuthProviderClient, credential: string) {
    return httpClient.post('/login', {
      provider: provider.id,
      credential
    }, postOptions)
  },

  logout() {
    return httpClient.get('/logout', { withCredentials: true })
  }
}
