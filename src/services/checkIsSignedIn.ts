import Cookies from 'js-cookie'

export default function checkIsSignedIn() {
    return !!Cookies.get('session-token')
}
