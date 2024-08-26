import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

export default function checkIsSignedIn() {
  let result = false
  const sessionToken = Cookies.get('session-token')
  if(typeof sessionToken === 'string') {
    try {
      result = new Date(Number(jwtDecode(sessionToken).exp)).getTime() <= Date.now()
    } catch (error) {
      console.log(error)
    }
  }
  return result
}
