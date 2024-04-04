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
    if (active.success) {
      toast.info('Chuyển đến trang đăng nhập')
    }
    setTimeout(() => {
      window.location.assign('/login.html')
    }, 500)
  } else {
    window.location.assign('/login.html')
  }
})()
