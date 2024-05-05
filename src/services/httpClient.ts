import axios from 'axios'
import httpErrors from './httpErrors'
import { initDefaultAuth } from '@/services/auth'

axios.defaults.baseURL = '/api'

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if(error.response?.data?.error === httpErrors.unverified) {
      initDefaultAuth()
    }
    return Promise.reject(error)
  }
)

export const postOptions = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  withCredentials: true
}

export default axios
