import userApi from '../api/userApi'
import { toast } from './toast'

export async function checkLogoutAccount() {
  const infoUserStorage = JSON.parse(localStorage.getItem('accessTokenAdmin'))
  if (infoUserStorage) {
    await userApi.logout()
    localStorage.removeItem('accessTokenAdmin')
    toast.info('Chuyển đến trang đăng nhập')
    setTimeout(() => {
      window.location.assign('/admin/login.html')
    }, 2000)
  }
}
