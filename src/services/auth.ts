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

type PromptMomentNotification = {
  isSkippedMoment(): boolean
  getSkippedReason(): string
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

let googleCredentialCallback: ((response: AuthCredentialResponse) => void) | null = null
let googleButtonElement: HTMLElement | null = null
let googleFedCmEnabled = false
let isPromptActive = false

export const GoogleAuth: AuthProviderClient = {
  id: 'google',

  init(callback) {
    googleCredentialCallback = callback
    googleFedCmEnabled = shouldUseFedCm()

    return googleScriptReady.then(() => {
      initializeGoogleAuth()
    })
  },

  renderButton(element) {
    if (!element) return Promise.resolve()

    googleButtonElement = element

    return googleScriptReady.then(() => {
      renderGoogleButton()
    })
  },

  prompt() {
    return googleScriptReady.then(() => {
      if (isPromptActive) return

      isPromptActive = true
      google.accounts.id.prompt((notification: PromptMomentNotification) => {
        if (notification.isSkippedMoment()) {
          isPromptActive = false
        }

        if (shouldFallbackFromFedCm(notification)) {
          fallbackToClassicGoogleAuth()
        }
      })
    })
  }
}

function shouldUseFedCm() {
  return import.meta.env.APP_USE_FEDCM !== 'false'
}

function initializeGoogleAuth() {
  if (!googleCredentialCallback) {
    throw new Error('Google auth callback is not configured')
  }

  google.accounts.id.initialize({
    client_id: import.meta.env.APP_GOOGLE_CLIENT_ID,
    callback: googleCredentialCallback,
    ux_mode: 'popup',
    ...googleFedCmPromptOptions()
  } as google.accounts.id.IdConfiguration & Record<string, unknown>)
}

function renderGoogleButton() {
  if (!googleButtonElement) return

  googleButtonElement.replaceChildren()

  google.accounts.id.renderButton(googleButtonElement, {
    theme: 'outline',
    size: 'large',
    type: 'standard',
    ...googleFedCmButtonOptions()
  } as google.accounts.id.GsiButtonConfiguration & Record<string, unknown>)
}

function googleFedCmPromptOptions() {
  return googleFedCmEnabled ? { use_fedcm_for_prompt: true } : {}
}

function googleFedCmButtonOptions() {
  return googleFedCmEnabled ? { use_fedcm_for_button: true } : {}
}

function shouldFallbackFromFedCm(notification: PromptMomentNotification) {
  return googleFedCmEnabled
    && notification.isSkippedMoment()
    && notification.getSkippedReason() === 'issuing_failed'
}

function fallbackToClassicGoogleAuth() {
  googleFedCmEnabled = false
  isPromptActive = false
  initializeGoogleAuth()
  google.accounts.id.prompt()
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
  },

  deleteAccount() {
    return httpClient.delete('/account', { withCredentials: true })
  }
}
