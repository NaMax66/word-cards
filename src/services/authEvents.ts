const authRequiredEvent = 'word-cards:auth-required'

export function requestAuthentication() {
  window.dispatchEvent(new CustomEvent(authRequiredEvent))
}

export function onAuthenticationRequired(handler: () => void) {
  window.addEventListener(authRequiredEvent, handler)

  return () => window.removeEventListener(authRequiredEvent, handler)
}
