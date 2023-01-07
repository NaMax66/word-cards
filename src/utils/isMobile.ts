const isMobile = (): boolean => {
  const phones: string[] = ['Android', 'webOS', 'iPhone', 'iPod', 'BlackBerry', 'Windows Phone']

  const isMobile = (phone: string): boolean => Boolean(navigator.userAgent.match(new RegExp(phone, 'i')))

  return phones.some(isMobile)
}

export default isMobile()
