import axios from 'axios'
import { toast } from '../utils'

const axiosClient = axios.create({
  baseURL: 'https://backend-ismart.vercel.app/api/',
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
  async function (error) {
    if (!error.response) {
      throw new Error('Network error. Please try again later')
    }
    const { data } = error.response
    if (!data.success && data.isRedirect) {
      await axiosClient.removeLocalStorage()
      window.location.assign('/login.html')
    }
    if (error.response.status === 401) {
      if (data.message === 'Unauthorization') {
        await axiosClient.removeLocalStorage()
        window.location.assign('/login.html')
      } else {
        toast.error('Tài khoản đã bị xoá!')
      }
    }
    return Promise.reject(error)
  },
)
export default axiosClient
