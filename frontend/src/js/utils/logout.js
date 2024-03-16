import { toast } from './toast'

export function checkLogoutAccount() {
  const infoUserStorage = JSON.parse(localStorage.getItem('user_info'))
  if (infoUserStorage) {
    const newInfo = infoUserStorage.filter((user) => user?.roleID !== 2)
    localStorage.setItem('user_info', JSON.stringify(newInfo))
    toast.info('Chuyển đến trang đăng nhập')
    setTimeout(() => {
      window.location.assign('/admin/login.html')
    }, 2000)
  }
}
