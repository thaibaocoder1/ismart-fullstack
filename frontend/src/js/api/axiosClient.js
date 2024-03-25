import axios from 'axios'

const axiosClient = axios.create({
  baseURL: 'http://localhost:3001/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})
axiosClient.getLocalAccessToken = async () => {
  const accessToken = window.localStorage.getItem('accessToken')
  return JSON.parse(accessToken) || null
}
axiosClient.getLocalAccessTokenAdmin = async () => {
  const accessToken = window.localStorage.getItem('accessTokenAdmin')
  return JSON.parse(accessToken) || null
}
axiosClient.getRefershToken = async () => {
  return await axiosClient.get('users/auth/refresh')
}
axiosClient.setLocalStorage = async (data) => {
  window.localStorage.setItem('accessToken', JSON.stringify(data))
}
axiosClient.removeLocalStorage = async () => {
  window.localStorage.removeItem('accessToken')
}
axiosClient.getRefershTokenAdmin = async () => {
  return await axiosClient.get('users/auth/refreshAdmin')
}
axiosClient.setLocalStorageAdmin = async (data) => {
  window.localStorage.setItem('accessTokenAdmin', JSON.stringify(data))
}
axiosClient.removeLocalStorageAdmin = async () => {
  window.localStorage.removeItem('accessTokenAdmin')
}
// Add a request interceptor
axiosClient.interceptors.request.use(
  async function (config) {
    const dataLocal = await axiosClient.getLocalAccessToken()
    const dataLocalAdmin = await axiosClient.getLocalAccessTokenAdmin()
    if (dataLocal) {
      if (
        config.url.indexOf('users/auth/refreshAdmin') >= 0 ||
        config.url.indexOf('users/auth/refresh') >= 0
      ) {
        return config
      }
      const { accessToken, expireIns } = await axiosClient.getLocalAccessToken()
      const now = new Date().getTime()
      if (expireIns < now) {
        try {
          const refreshToken = await axiosClient.getRefershToken()
          if (refreshToken.success) {
            await axiosClient.setLocalStorage(refreshToken.data)
          }
          if (refreshToken.remove) {
            await axiosClient.removeLocalStorage()
          }
        } catch (error) {
          return Promise.reject(error)
        }
      }
      return config
    }
    if (dataLocalAdmin) {
      if (
        config.url.indexOf('users/auth/refreshAdmin') >= 0 ||
        config.url.indexOf('users/auth/refresh') >= 0
      ) {
        return config
      }
      const { accessToken, expireIns } = await axiosClient.getLocalAccessTokenAdmin()
      const now = new Date().getTime()
      if (expireIns < now) {
        try {
          const refreshToken = await axiosClient.getRefershTokenAdmin()
          if (refreshToken.success) {
            await axiosClient.setLocalStorageAdmin(refreshToken.data)
          }
          if (refreshToken.remove) {
            await axiosClient.removeLocalStorageAdmin()
          }
        } catch (error) {
          return Promise.reject(error)
        }
      }
      return config
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

// Add a response interceptor
axiosClient.interceptors.response.use(
  function (response) {
    return response.data
  },
  function (error) {
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
