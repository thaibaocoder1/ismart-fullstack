import axios from 'axios'

const axiosClient = axios.create({
  baseURL: 'http://localhost:3001/',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor
axiosClient.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    // Attach token to request if exists
    const userInfo = localStorage.getItem('user_info')
    if (userInfo) {
      const data = JSON.parse(userInfo)
      if (data.length === 1) {
        const accessToken = data[0].accessToken
        config.headers.Authorization = `Bearer ${accessToken}`
      } else {
        const userCustomer = data.find((x) => x.role === 'User')
        const accessToken = userCustomer.accessToken
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    }

    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  },
)

// Add a response interceptor
axiosClient.interceptors.response.use(
  function (response) {
    return response.data
  },
  function (error) {
    console.log('axiosClient response error', error)
    if (!error.response) {
      throw new Error('Network error. Please try again later')
    }
    // Redirect to login if not login
    if (error.response.status === 401) {
      window.location.assign('/login.html')
      return
    }
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error)
  },
)
export default axiosClient
