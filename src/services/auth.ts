const hasLib = new Promise(resolve => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    document.body.appendChild(script)
    script.onload = resolve
  })

export const GoogleAuth = {
  init(callback: () => void) {
    return hasLib.then(() => {
      google.accounts.id.initialize({
        client_id: import.meta.env.APP_GOOGLE_CLIENT_ID,
        callback
      })
    })
  },

  renderButton(element: HTMLElement) {
    return hasLib.then(() => {
      google.accounts.id.renderButton(element, { theme: 'outline', size: 'large', type: 'standard' })
    })
  },

  popupLogin() {
    return hasLib.then(() => {
      google.accounts.id.prompt()
    })
  }
}

export function initDefaultAuth() {
  GoogleAuth.popupLogin()
}
