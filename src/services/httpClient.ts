import axios from 'axios'

axios.defaults.baseURL = import.meta.env.APP_API_URL

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error.response?.data?.error)
    return Promise.reject(error)
  }
)

export default axios
