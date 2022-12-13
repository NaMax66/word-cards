export function observeTabOpen(cb: Function) {
  document.addEventListener('visibilitychange', () => {
    if(!document.hidden) {
      cb()
    }
  })
}
