import userApi from './api/userApi'
import { toast } from './utils'
// main
;(async () => {
  const searchParams = new URLSearchParams(location.search)
  const activeID = searchParams.get('id')
  if (activeID && activeID !== null) {
    const modal = document.getElementById('modal')
    modal && modal.classList.add('is-show')
    const active = await userApi.active(activeID)
    console.log(active)
    if (active.success && !active.isActive) {
      toast.info('Chuyển đến trang đăng nhập')
      setTimeout(() => {
        window.location.assign('/login.html')
      }, 1000)
    } else {
      toast.info('Tài khoản đã được kích hoạt')
      setTimeout(() => {
        window.location.assign('/login.html')
      }, 2000)
    }
  } else {
    window.location.assign('/login.html')
  }
})()
