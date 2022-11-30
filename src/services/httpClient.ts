import axios from 'axios'
import httpErrors from './httpErrors'
import { initDefaultAuth } from '@/services/auth'

axios.defaults.baseURL = import.meta.env.APP_API_URL

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if(error.response?.data?.error === httpErrors.unverified) {
      initDefaultAuth()
    }
    return Promise.reject(error)
  }
)

export default axios
