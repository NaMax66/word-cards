import axios from 'axios'
import httpErrors from './httpErrors'
import { requestAuthentication } from '@/services/authEvents'

axios.defaults.baseURL = '/api'
axios.defaults.withCredentials = true

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if(error.response?.data?.error === httpErrors.unverified) {
      requestAuthentication()
    }
    return Promise.reject(error)
  }
)

type FormPrimitive = string | number | boolean | null | undefined
type FormValue = FormPrimitive | FormObject
interface FormObject {
  [key: string]: FormValue
}

export const postOptions = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  withCredentials: true,
  transformRequest: [(data: unknown) => {
    if (data instanceof URLSearchParams || typeof data === 'string') {
      return data.toString()
    }

    if (!data || typeof data !== 'object') {
      return data
    }

    return toFormBody(data as FormObject).toString()
  }]
}

export default axios

function toFormBody(data: FormObject) {
  const body = new URLSearchParams()
  appendFormValue(body, '', data)

  return body
}

function appendFormValue(body: URLSearchParams, key: string, value: FormValue) {
  if (value === null || value === undefined) return

  if (typeof value === 'object') {
    for (const [childKey, childValue] of Object.entries(value)) {
      appendFormValue(body, key ? `${key}[${childKey}]` : childKey, childValue)
    }
    return
  }

  body.set(key, String(value))
}
