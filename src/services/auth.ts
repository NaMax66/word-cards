export const GoogleAuth = {
  init(callback: () => void) {
    google.accounts.id.initialize({
      client_id: import.meta.env.APP_GOOGLE_CLIENT_ID,
      callback
    })
  },

  renderButton(element: HTMLElement) {
    google.accounts.id.renderButton(element, { theme: 'outline', size: 'large', type: 'standard' })
  },

  popupLogin() {
    google.accounts.id.prompt()
  }
}

export function initDefaultAuth() {
  GoogleAuth.popupLogin()
}
