import axios from 'axios'

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error.response?.data?.error)
    return Promise.reject(error)
  }
)

export default axios
