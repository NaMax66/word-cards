export function scrollBottom(element: HTMLElement | null, isSmooth = false) {
  if(!element) return

  if(isSmooth) {
    element.animate({
      scrollTop: element.scrollHeight
    }, 500)
  } else {
    element.scrollTop = element.scrollHeight
  }
}
